import json
import secrets
import string
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User,
    Assessment,
    AssessmentQuestion,
    UserAssessment,
    UserModuleProgress,
    CourseModule,
    Certificate,
)
from app.schemas import (
    AssessmentResponse,
    AssessmentListResponse,
    AssessmentStartResponse,
    AssessmentQuestionPublic,
    AssessmentAutoSaveRequest,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    QuestionReview,
    CertificateGenerateRequest,
    CertificateResponse,
    CertificatePublicResponse,
    CertificateListResponse,
    ErrorResponse,
)

router = APIRouter(tags=["assessments"])


# ─── Helpers ──────────────────────────────────────────────


def _parse_iso(s: str) -> datetime:
    """Parse ISO timestamp string to datetime."""
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _generate_cert_number() -> str:
    year = _utc_now().year
    chars = string.ascii_uppercase + string.digits
    rand = "".join(secrets.choice(chars) for _ in range(6))
    return f"IKL-{year}-{rand}"


def _generate_cert_slug() -> str:
    return secrets.token_urlsafe(60)[:80]


def _get_user_status(
    assessment: Assessment,
    attempts: list[UserAssessment],
    module_completed: bool,
) -> dict:
    """Compute user status for an assessment."""
    if not module_completed:
        return {"status": "locked", "best_score": None, "last_attempt_at": None, "cooldown_until": None}

    passed_attempt = next((a for a in attempts if a.passed == 1), None)
    if passed_attempt:
        return {
            "status": "passed",
            "best_score": max(a.score for a in attempts if a.score is not None),
            "last_attempt_at": passed_attempt.submitted_at,
            "cooldown_until": None,
        }

    if not attempts:
        return {"status": "available", "best_score": None, "last_attempt_at": None, "cooldown_until": None}

    # Check for in-progress attempt
    active = next((a for a in attempts if a.status == "in_progress"), None)
    if active:
        return {"status": "in_progress", "best_score": None, "last_attempt_at": None, "cooldown_until": None}

    # Check cooldown from last failed attempt
    last = max(attempts, key=lambda a: a.submitted_at or a.started_at)
    if last.submitted_at:
        cooldown_end = _parse_iso(last.submitted_at) + timedelta(hours=assessment.retry_cooldown_hours)
        if _utc_now() < cooldown_end:
            return {
                "status": "cooldown",
                "best_score": max((a.score for a in attempts if a.score is not None), default=None),
                "last_attempt_at": last.submitted_at,
                "cooldown_until": cooldown_end.isoformat(),
            }

    return {
        "status": "available",
        "best_score": max((a.score for a in attempts if a.score is not None), default=None),
        "last_attempt_at": last.submitted_at if last.submitted_at else None,
        "cooldown_until": None,
    }


# ─── Assessment Endpoints ────────────────────────────────


@router.get("/assessments", response_model=AssessmentListResponse)
def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessments = (
        db.query(Assessment)
        .filter(Assessment.is_published == 1)
        .order_by(Assessment.created_at)
        .all()
    )

    # Get all user's module progress
    progress_rows = (
        db.query(UserModuleProgress)
        .filter(UserModuleProgress.user_id == current_user.id)
        .all()
    )
    completed_modules = {p.module_id for p in progress_rows if p.is_completed == 1}

    # Get all user's assessment attempts
    assessment_ids = [a.id for a in assessments]
    attempts = (
        db.query(UserAssessment)
        .filter(
            UserAssessment.user_id == current_user.id,
            UserAssessment.assessment_id.in_(assessment_ids) if assessment_ids else False,
        )
        .all()
    )
    attempts_by_assessment = {}
    for att in attempts:
        attempts_by_assessment.setdefault(att.assessment_id, []).append(att)

    # Get module info
    module_ids = [a.module_id for a in assessments]
    modules = db.query(CourseModule).filter(CourseModule.id.in_(module_ids) if module_ids else False).all()
    modules_map = {m.id: m for m in modules}

    result = []
    for a in assessments:
        module = modules_map.get(a.module_id)
        user_attempts = attempts_by_assessment.get(a.id, [])
        status_info = _get_user_status(a, user_attempts, a.module_id in completed_modules)

        resp = AssessmentResponse(
            id=a.id,
            module_id=a.module_id,
            title=a.title,
            description=a.description,
            time_limit_seconds=a.time_limit_seconds,
            pass_threshold=a.pass_threshold,
            total_questions=a.total_questions,
            retry_cooldown_hours=a.retry_cooldown_hours,
            is_published=a.is_published,
            created_at=a.created_at,
            module_title=module.title if module else None,
            module_category=module.category if module else None,
            user_status=status_info["status"],
            best_score=status_info["best_score"],
            last_attempt_at=status_info["last_attempt_at"],
            cooldown_until=status_info["cooldown_until"],
        )
        result.append(resp)

    return AssessmentListResponse(assessments=result)


@router.post(
    "/assessments/{assessment_id}/start",
    response_model=AssessmentStartResponse,
    responses={400: {"model": ErrorResponse}, 403: {"model": ErrorResponse}},
)
def start_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Check module completion
    progress = (
        db.query(UserModuleProgress)
        .filter(
            UserModuleProgress.user_id == current_user.id,
            UserModuleProgress.module_id == assessment.module_id,
        )
        .first()
    )
    if not progress or progress.is_completed != 1:
        raise HTTPException(
            status_code=403,
            detail="Complete the course module first",
        )

    # Check for active in-progress attempt
    active = (
        db.query(UserAssessment)
        .filter(
            UserAssessment.user_id == current_user.id,
            UserAssessment.assessment_id == assessment_id,
            UserAssessment.status == "in_progress",
        )
        .first()
    )
    if active:
        # Check if it's expired (started_at + time_limit + 30s grace)
        started = _parse_iso(active.started_at)
        expiry = started + timedelta(seconds=assessment.time_limit_seconds + 30)
        if _utc_now() > expiry:
            active.status = "expired"
            active.submitted_at = _utc_now().isoformat()
            active.score = 0
            active.passed = 0
            db.commit()
        else:
            # Return existing active attempt with questions + saved answers
            questions = (
                db.query(AssessmentQuestion)
                .filter(AssessmentQuestion.assessment_id == assessment_id)
                .order_by(AssessmentQuestion.order_index)
                .all()
            )
            # Restore saved answers
            saved_answers = None
            if active.answers_json:
                try:
                    saved_answers = json.loads(active.answers_json)
                except (json.JSONDecodeError, TypeError):
                    saved_answers = None

            remaining = int((started + timedelta(seconds=assessment.time_limit_seconds) - _utc_now()).total_seconds())
            remaining = max(remaining, 0)

            return AssessmentStartResponse(
                attempt_id=active.id,
                assessment_id=assessment_id,
                questions=[
                    AssessmentQuestionPublic(
                        id=q.id,
                        question=q.question,
                        options_json=q.options_json,
                        order_index=q.order_index,
                    )
                    for q in questions
                ],
                expires_at=(started + timedelta(seconds=assessment.time_limit_seconds)).isoformat(),
                time_limit_seconds=remaining,
                saved_answers=saved_answers,
            )

    # Check 24h cooldown from last failed attempt
    last_attempt = (
        db.query(UserAssessment)
        .filter(
            UserAssessment.user_id == current_user.id,
            UserAssessment.assessment_id == assessment_id,
            UserAssessment.status.in_(["submitted", "expired"]),
            UserAssessment.passed == 0,
        )
        .order_by(UserAssessment.submitted_at.desc())
        .first()
    )
    if last_attempt and last_attempt.submitted_at:
        cooldown_end = _parse_iso(last_attempt.submitted_at) + timedelta(
            hours=assessment.retry_cooldown_hours
        )
        if _utc_now() < cooldown_end:
            raise HTTPException(
                status_code=400,
                detail=f"Retry available after {cooldown_end.isoformat()}",
            )

    # Already passed? Don't allow retake
    passed = (
        db.query(UserAssessment)
        .filter(
            UserAssessment.user_id == current_user.id,
            UserAssessment.assessment_id == assessment_id,
            UserAssessment.passed == 1,
        )
        .first()
    )
    if passed:
        raise HTTPException(status_code=400, detail="Assessment already passed")

    # Create new attempt
    now = _utc_now()
    attempt = UserAssessment(
        user_id=current_user.id,
        assessment_id=assessment_id,
        started_at=now.isoformat(),
        status="in_progress",
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Fetch questions (without correct_index)
    questions = (
        db.query(AssessmentQuestion)
        .filter(AssessmentQuestion.assessment_id == assessment_id)
        .order_by(AssessmentQuestion.order_index)
        .all()
    )

    return AssessmentStartResponse(
        attempt_id=attempt.id,
        assessment_id=assessment_id,
        questions=[
            AssessmentQuestionPublic(
                id=q.id,
                question=q.question,
                options_json=q.options_json,
                order_index=q.order_index,
            )
            for q in questions
        ],
        expires_at=(now + timedelta(seconds=assessment.time_limit_seconds)).isoformat(),
        time_limit_seconds=assessment.time_limit_seconds,
    )


@router.post(
    "/assessments/{assessment_id}/autosave",
    responses={400: {"model": ErrorResponse}},
)
def autosave_answers(
    assessment_id: str,
    body: AssessmentAutoSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save answers periodically during assessment (every 60s)."""
    attempt = db.query(UserAssessment).filter(UserAssessment.id == body.attempt_id).first()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Attempt not active")

    # Validate time hasn't expired
    started = _parse_iso(attempt.started_at)
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    max_time = assessment.time_limit_seconds + 30
    elapsed = (_utc_now() - started).total_seconds()
    if elapsed > max_time:
        attempt.status = "expired"
        attempt.submitted_at = _utc_now().isoformat()
        attempt.score = 0
        attempt.passed = 0
        db.commit()
        raise HTTPException(status_code=400, detail="Time expired")

    # Save answers to DB
    attempt.answers_json = json.dumps(
        [{"question_id": a.question_id, "selected_index": a.selected_index} for a in body.answers]
    )
    db.commit()

    return {"status": "saved", "answers_count": len(body.answers)}


@router.post(
    "/assessments/{assessment_id}/submit",
    response_model=AssessmentResultResponse,
    responses={400: {"model": ErrorResponse}},
)
def submit_assessment(
    assessment_id: str,
    body: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate attempt
    attempt = db.query(UserAssessment).filter(UserAssessment.id == body.attempt_id).first()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Attempt already submitted")

    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Check time (with 30s grace period)
    now = _utc_now()
    started = _parse_iso(attempt.started_at)
    max_time = assessment.time_limit_seconds + 30
    elapsed = (now - started).total_seconds()
    is_expired = elapsed > max_time

    # Fetch all questions with correct answers
    questions = (
        db.query(AssessmentQuestion)
        .filter(AssessmentQuestion.assessment_id == assessment_id)
        .order_by(AssessmentQuestion.order_index)
        .all()
    )
    questions_map = {q.id: q for q in questions}

    # Build answers map from submission
    answers_map = {a.question_id: a.selected_index for a in body.answers}

    # Score
    score = 0
    reviews = []
    for q in questions:
        selected = answers_map.get(q.id)
        is_correct = selected is not None and selected == q.correct_index
        if is_correct:
            score += 1
        options = json.loads(q.options_json) if q.options_json else []
        reviews.append(
            QuestionReview(
                question_id=q.id,
                question=q.question,
                options=options,
                selected_index=selected,
                correct_index=q.correct_index,
                is_correct=is_correct,
                explanation=q.explanation,
            )
        )

    passed = 1 if score >= assessment.pass_threshold else 0
    time_taken = min(int(elapsed), assessment.time_limit_seconds)

    # Update attempt
    attempt.submitted_at = now.isoformat()
    attempt.answers_json = json.dumps([{"question_id": a.question_id, "selected_index": a.selected_index} for a in body.answers])
    attempt.score = score
    attempt.passed = passed
    attempt.time_taken_seconds = time_taken
    attempt.status = "expired" if is_expired else "submitted"
    db.commit()

    # Get module title
    module = db.query(CourseModule).filter(CourseModule.id == assessment.module_id).first()

    # Check if certificate already exists
    existing_cert = (
        db.query(Certificate)
        .filter(Certificate.user_assessment_id == attempt.id)
        .first()
    )

    return AssessmentResultResponse(
        attempt_id=attempt.id,
        assessment_id=assessment_id,
        module_title=module.title if module else "",
        score=score,
        total=assessment.total_questions,
        percentage=round((score / assessment.total_questions) * 100, 1),
        passed=passed == 1,
        time_taken_seconds=time_taken,
        submitted_at=attempt.submitted_at,
        questions=reviews,
        can_get_certified=passed == 1 and existing_cert is None,
        certificate_id=existing_cert.cert_slug if existing_cert else None,
    )


@router.get(
    "/assessments/results/{attempt_id}",
    response_model=AssessmentResultResponse,
)
def get_assessment_result(
    attempt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempt = db.query(UserAssessment).filter(UserAssessment.id == attempt_id).first()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status == "in_progress":
        raise HTTPException(status_code=400, detail="Assessment not yet submitted")

    assessment = db.query(Assessment).filter(Assessment.id == attempt.assessment_id).first()
    module = db.query(CourseModule).filter(CourseModule.id == assessment.module_id).first()

    questions = (
        db.query(AssessmentQuestion)
        .filter(AssessmentQuestion.assessment_id == assessment.id)
        .order_by(AssessmentQuestion.order_index)
        .all()
    )

    answers_map = {}
    if attempt.answers_json:
        for a in json.loads(attempt.answers_json):
            answers_map[a["question_id"]] = a["selected_index"]

    reviews = []
    for q in questions:
        selected = answers_map.get(q.id)
        options = json.loads(q.options_json) if q.options_json else []
        reviews.append(
            QuestionReview(
                question_id=q.id,
                question=q.question,
                options=options,
                selected_index=selected,
                correct_index=q.correct_index,
                is_correct=selected is not None and selected == q.correct_index,
                explanation=q.explanation,
            )
        )

    existing_cert = (
        db.query(Certificate)
        .filter(Certificate.user_assessment_id == attempt.id)
        .first()
    )

    return AssessmentResultResponse(
        attempt_id=attempt.id,
        assessment_id=assessment.id,
        module_title=module.title if module else "",
        score=attempt.score or 0,
        total=assessment.total_questions,
        percentage=round(((attempt.score or 0) / assessment.total_questions) * 100, 1),
        passed=attempt.passed == 1,
        time_taken_seconds=attempt.time_taken_seconds or 0,
        submitted_at=attempt.submitted_at or "",
        questions=reviews,
        can_get_certified=attempt.passed == 1 and existing_cert is None,
        certificate_id=existing_cert.cert_slug if existing_cert else None,
    )


# ─── Certificate Endpoints ───────────────────────────────


@router.post(
    "/certificates/generate",
    response_model=CertificateResponse,
    responses={400: {"model": ErrorResponse}},
)
def generate_certificate(
    body: CertificateGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempt = db.query(UserAssessment).filter(UserAssessment.id == body.attempt_id).first()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.passed != 1:
        raise HTTPException(status_code=400, detail="Assessment not passed")

    # Check if cert already exists
    existing = (
        db.query(Certificate)
        .filter(Certificate.user_assessment_id == attempt.id)
        .first()
    )
    if existing:
        return CertificateResponse(
            id=existing.id,
            cert_number=existing.cert_number,
            cert_slug=existing.cert_slug,
            issued_at=existing.issued_at,
        )

    assessment = db.query(Assessment).filter(Assessment.id == attempt.assessment_id).first()
    module = db.query(CourseModule).filter(CourseModule.id == assessment.module_id).first()

    cert_number = _generate_cert_number()
    cert_slug = _generate_cert_slug()

    # Ensure uniqueness
    while db.query(Certificate).filter(Certificate.cert_number == cert_number).first():
        cert_number = _generate_cert_number()
    while db.query(Certificate).filter(Certificate.cert_slug == cert_slug).first():
        cert_slug = _generate_cert_slug()

    # Grade calculation
    pct = (attempt.score / assessment.total_questions) * 100
    if pct >= 90:
        grade = "A+"
    elif pct >= 80:
        grade = "A"
    elif pct >= 70:
        grade = "B+"
    else:
        grade = "B"

    cert_data = {
        "student_name": current_user.name,
        "student_email": current_user.email,
        "college": current_user.college,
        "module_title": module.title if module else "",
        "module_category": module.category if module else "",
        "score": attempt.score,
        "total": assessment.total_questions,
        "percentage": round(pct, 1),
        "grade": grade,
        "cert_number": cert_number,
        "cert_slug": cert_slug,
        "issued_date": _utc_now().strftime("%B %d, %Y"),
        "issued_at": _utc_now().isoformat(),
        "cert_url": f"https://iklavya.in/cert/{cert_slug}",
    }

    cert = Certificate(
        cert_number=cert_number,
        cert_slug=cert_slug,
        user_id=current_user.id,
        user_assessment_id=attempt.id,
        module_id=assessment.module_id,
        cert_data_json=json.dumps(cert_data),
        issued_at=_utc_now().isoformat(),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return CertificateResponse(
        id=cert.id,
        cert_number=cert.cert_number,
        cert_slug=cert.cert_slug,
        module_title=module.title if module else None,
        score=attempt.score,
        issued_at=cert.issued_at,
    )


@router.get("/certificates/my", response_model=CertificateListResponse)
def my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    certs = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    result = []
    for c in certs:
        module = db.query(CourseModule).filter(CourseModule.id == c.module_id).first()
        data = json.loads(c.cert_data_json) if c.cert_data_json else {}
        result.append(
            CertificateResponse(
                id=c.id,
                cert_number=c.cert_number,
                cert_slug=c.cert_slug,
                module_title=module.title if module else None,
                score=data.get("score"),
                issued_at=c.issued_at,
            )
        )
    return CertificateListResponse(certificates=result)


@router.get("/certificates/public/{cert_slug}")
def public_certificate(cert_slug: str, db: Session = Depends(get_db)):
    """Public endpoint — no auth required. Returns certificate data for rendering."""
    cert = db.query(Certificate).filter(Certificate.cert_slug == cert_slug).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    from fastapi.responses import JSONResponse

    return JSONResponse(
        content={"cert_data_json": cert.cert_data_json},
        headers={
            "Cache-Control": "public, max-age=86400, immutable",
        },
    )


# ─── Admin: Seed Assessments ─────────────────────────────


@router.get("/assessments/seed")
def seed_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    existing = db.query(Assessment).first()
    if existing:
        return {"message": "Assessments already seeded", "count": db.query(Assessment).count()}

    from app.data.assessment_seed import ASSESSMENT_SEED_DATA

    count = 0
    for module_data in ASSESSMENT_SEED_DATA:
        # Find module by slug
        module = (
            db.query(CourseModule)
            .filter(CourseModule.slug == module_data["module_slug"])
            .first()
        )
        if not module:
            continue

        assessment = Assessment(
            module_id=module.id,
            title=module_data["title"],
            description=module_data["description"],
        )
        db.add(assessment)
        db.flush()

        for idx, q in enumerate(module_data["questions"]):
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                question=q["question"],
                options_json=json.dumps(q["options"]),
                correct_index=q["correct_index"],
                explanation=q.get("explanation", ""),
                order_index=idx,
            )
            db.add(question)

        count += 1

    db.commit()
    return {"message": f"Seeded {count} assessments", "count": count}
