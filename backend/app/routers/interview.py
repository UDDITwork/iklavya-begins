import json
import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, InterviewSession, InterviewMessage, InterviewReport
from app.schemas import (
    InterviewSessionCreateRequest,
    InterviewSessionResponse,
    InterviewSessionListResponse,
    InterviewSessionDetailResponse,
    InterviewMessageSendRequest,
    InterviewMessageResponse,
    InterviewReportResponse,
    InterviewTTSRequest,
    ErrorResponse,
)
from app.auth import get_current_user
from app.prompts import build_interview_system_prompt
from app.services.interview_service import (
    stream_interview_question,
    generate_interview_report,
    extract_interview_meta,
    check_interview_complete,
    clean_interview_response,
    detect_fillers,
)
from app.services.tts_service import synthesize_speech
from app.services.interview_pdf_service import generate_interview_pdf

router = APIRouter(prefix="/interview", tags=["interview"])

MAX_INTERVIEW_SESSIONS = 10
MAX_MESSAGES_PER_INTERVIEW = 60  # ~30 Q&A exchanges

# Simple in-memory TTS rate limiter: {user_id: [timestamps]}
_tts_calls: dict[str, list[float]] = {}
TTS_MAX_CALLS_PER_MINUTE = 15


# ── Health check ───────────────────────────────────────

@router.get("/health")
async def interview_health():
    """Test connectivity to Claude and ElevenLabs APIs without auth."""
    results = {"claude": "unknown", "elevenlabs": "unknown"}

    # Test Claude
    try:
        from app.services.claude_service import get_chat_response
        resp = await get_chat_response(
            system_prompt="Reply with exactly: OK",
            messages=[{"role": "user", "content": "ping"}],
        )
        results["claude"] = "ok" if resp and len(resp) > 0 else "empty_response"
    except Exception as e:
        results["claude"] = f"error: {str(e)[:100]}"

    # Test ElevenLabs (use voices list endpoint — works with TTS-only keys)
    try:
        from app.config import ELEVENLABS_API_KEY
        if not ELEVENLABS_API_KEY:
            results["elevenlabs"] = "no_api_key"
        else:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(
                    "https://api.elevenlabs.io/v1/voices",
                    headers={"xi-api-key": ELEVENLABS_API_KEY},
                )
                if r.status_code == 200:
                    results["elevenlabs"] = "ok"
                elif r.status_code == 401:
                    results["elevenlabs"] = "invalid_api_key"
                else:
                    results["elevenlabs"] = f"http_{r.status_code}"
    except Exception as e:
        results["elevenlabs"] = f"error: {str(e)[:100]}"

    all_ok = all(v == "ok" for v in results.values())
    return {"status": "healthy" if all_ok else "degraded", "services": results}


def _get_interview_or_404(
    session_id: str, user_id: str, db: Session
) -> InterviewSession:
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )
    return session


# ── List sessions ──────────────────────────────────────

@router.get("", response_model=InterviewSessionListResponse)
def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Auto-abandon stale sessions (setup/active for >2 hours)
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    stale = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status.in_(["setup", "active"]),
            InterviewSession.started_at < cutoff,
        )
        .all()
    )
    for s in stale:
        s.status = "abandoned"
    if stale:
        db.commit()

    # Single query with LEFT JOIN to avoid N+1
    from sqlalchemy import outerjoin
    rows = (
        db.query(InterviewSession, InterviewReport.overall_score)
        .outerjoin(InterviewReport, InterviewReport.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.started_at.desc())
        .all()
    )

    result = []
    for session_obj, score in rows:
        data = InterviewSessionResponse.model_validate(session_obj)
        if score is not None:
            data.overall_score = score
        result.append(data)

    return InterviewSessionListResponse(sessions=result)


# ── Create session ─────────────────────────────────────

@router.post(
    "",
    response_model=InterviewSessionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={429: {"model": ErrorResponse}},
)
def create_interview_session(
    data: InterviewSessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active_count = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status.in_(["setup", "active"]),
        )
        .count()
    )
    if active_count >= MAX_INTERVIEW_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_INTERVIEW_SESSIONS} active interview sessions allowed.",
        )

    session = InterviewSession(
        user_id=current_user.id,
        job_role=data.job_role,
        job_description=data.job_description,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return InterviewSessionResponse.model_validate(session)


# ── Get session detail ─────────────────────────────────

@router.get(
    "/{session_id}",
    response_model=InterviewSessionDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)
    messages = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.session_id == session_id)
        .order_by(InterviewMessage.message_order.asc())
        .all()
    )
    session_data = InterviewSessionResponse.model_validate(session)
    report = db.query(InterviewReport).filter(
        InterviewReport.session_id == session_id
    ).first()
    if report:
        session_data.overall_score = report.overall_score

    return InterviewSessionDetailResponse(
        session=session_data,
        messages=[InterviewMessageResponse.model_validate(m) for m in messages],
    )


# ── Upload resume ──────────────────────────────────────

@router.post(
    "/{session_id}/upload-resume",
    responses={404: {"model": ErrorResponse}},
)
async def upload_interview_resume(
    session_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    if session.status != "setup":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload resume after interview has started",
        )

    content = await file.read()

    # Extract text based on file type
    extracted_text = ""
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            extracted_text = "\n".join(pages_text)
    elif filename.endswith(".docx"):
        from docx import Document
        doc = Document(io.BytesIO(content))
        extracted_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    elif filename.endswith(".txt"):
        extracted_text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Upload PDF, DOCX, or TXT.",
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from the uploaded file.",
        )

    session.resume_text = extracted_text.strip()
    db.commit()

    return {"message": "Resume uploaded successfully", "characters": len(extracted_text)}


# ── Start interview ────────────────────────────────────

@router.post(
    "/{session_id}/start",
    responses={404: {"model": ErrorResponse}},
)
async def start_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    if session.status != "setup":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview has already been started",
        )

    session.status = "active"
    session.interview_started_at = datetime.now(timezone.utc).isoformat()
    db.commit()

    # Build system prompt and generate first question
    system_prompt = build_interview_system_prompt(
        job_role=session.job_role,
        resume_text=session.resume_text,
        job_description=session.job_description,
    )

    user_id = current_user.id
    full_chunks = []
    meta = None

    async def event_generator():
        nonlocal full_chunks, meta
        try:
            async for chunk in stream_interview_question(system_prompt, [{"role": "user", "content": "Begin the interview."}]):
                full_chunks.append(chunk)
                yield f"event: message\ndata: {json.dumps({'text': chunk})}\n\n"

            complete_text = "".join(full_chunks)

            # Extract metadata
            meta = extract_interview_meta(complete_text)
            if meta:
                yield f"event: meta\ndata: {json.dumps(meta)}\n\n"

            yield "event: done\ndata: {}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        finally:
            if full_chunks:
                try:
                    raw_text = "".join(full_chunks)
                    stored_text = clean_interview_response(raw_text)

                    msg = InterviewMessage(
                        session_id=session_id,
                        user_id=user_id,
                        role="interviewer",
                        content=stored_text,
                        question_index=0,
                        is_follow_up=0,
                        message_order=1,
                    )
                    db.add(msg)

                    final_meta = extract_interview_meta(raw_text)
                    if final_meta and final_meta.get("estimated_remaining"):
                        s = db.query(InterviewSession).filter(
                            InterviewSession.id == session_id
                        ).first()
                        if s:
                            s.estimated_total = final_meta["question_number"] + final_meta["estimated_remaining"]
                            s.questions_answered = 0

                    db.commit()
                except Exception:
                    db.rollback()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Send message (candidate answer) ───────────────────

@router.post(
    "/{session_id}/message",
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def send_interview_message(
    session_id: str,
    data: InterviewMessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview is not active",
        )

    msg_count = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.session_id == session_id)
        .count()
    )
    if msg_count >= MAX_MESSAGES_PER_INTERVIEW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Maximum interview length reached.",
        )

    # Save candidate's answer
    candidate_msg = InterviewMessage(
        session_id=session_id,
        user_id=current_user.id,
        role="candidate",
        content=data.content,
        question_index=session.questions_answered,
        message_order=msg_count + 1,
    )
    db.add(candidate_msg)
    session.questions_answered = session.questions_answered + 1
    db.commit()

    # Load conversation history
    all_messages = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.session_id == session_id)
        .order_by(InterviewMessage.message_order.asc())
        .all()
    )

    # Map to Claude's expected format: interviewer=assistant, candidate=user
    chat_history = []
    for m in all_messages:
        role = "assistant" if m.role == "interviewer" else "user"
        chat_history.append({"role": role, "content": m.content})

    system_prompt = build_interview_system_prompt(
        job_role=session.job_role,
        resume_text=session.resume_text,
        job_description=session.job_description,
    )

    user_id = current_user.id
    new_msg_order = msg_count + 2
    full_chunks = []
    meta = None  # initialize before generator to avoid UnboundLocalError

    async def event_generator():
        nonlocal full_chunks, meta
        try:
            async for chunk in stream_interview_question(system_prompt, chat_history):
                full_chunks.append(chunk)
                yield f"event: message\ndata: {json.dumps({'text': chunk})}\n\n"

            complete_text = "".join(full_chunks)

            # Detect fillers in candidate's answer
            fillers = detect_fillers(data.content)
            if fillers:
                yield f"event: fillers\ndata: {json.dumps({'fillers': fillers})}\n\n"

            # Extract metadata
            meta = extract_interview_meta(complete_text)
            if meta:
                yield f"event: meta\ndata: {json.dumps(meta)}\n\n"

            # Check if interview is complete
            is_complete = check_interview_complete(complete_text)
            if is_complete:
                yield f"event: interview_complete\ndata: {json.dumps({'complete': True})}\n\n"

            yield "event: done\ndata: {}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        finally:
            if full_chunks:
                try:
                    raw_text = "".join(full_chunks)
                    stored_text = clean_interview_response(raw_text)

                    interviewer_msg = InterviewMessage(
                        session_id=session_id,
                        user_id=user_id,
                        role="interviewer",
                        content=stored_text,
                        question_index=session.questions_answered,
                        is_follow_up=1 if (meta and meta.get("is_follow_up")) else 0,
                        message_order=new_msg_order,
                    )
                    db.add(interviewer_msg)

                    # Update session estimates
                    s = db.query(InterviewSession).filter(
                        InterviewSession.id == session_id
                    ).first()
                    if s and meta and meta.get("estimated_remaining") is not None:
                        s.estimated_total = meta["question_number"] + meta["estimated_remaining"]

                    # Auto-complete if AI said so
                    is_done = check_interview_complete(raw_text)
                    if is_done and s:
                        s.status = "completed"
                        s.ended_at = datetime.now(timezone.utc).isoformat()
                        if s.interview_started_at:
                            try:
                                start = datetime.fromisoformat(s.interview_started_at)
                                end = datetime.now(timezone.utc)
                                s.duration_seconds = int((end - start).total_seconds())
                            except (ValueError, TypeError):
                                pass

                    db.commit()
                except Exception:
                    db.rollback()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── End interview ──────────────────────────────────────

@router.post(
    "/{session_id}/end",
    response_model=InterviewSessionResponse,
    responses={404: {"model": ErrorResponse}},
)
def end_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    if session.status not in ("active", "setup"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview is already ended",
        )

    session.status = "completed"
    session.ended_at = datetime.now(timezone.utc).isoformat()

    if session.interview_started_at:
        try:
            start = datetime.fromisoformat(session.interview_started_at)
            end = datetime.now(timezone.utc)
            session.duration_seconds = int((end - start).total_seconds())
        except (ValueError, TypeError):
            pass

    db.commit()
    db.refresh(session)
    return InterviewSessionResponse.model_validate(session)


# ── Generate report ────────────────────────────────────

@router.post(
    "/{session_id}/generate-report",
    responses={404: {"model": ErrorResponse}},
)
async def generate_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    if session.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview must be completed before generating report",
        )

    # Check if report already exists
    existing = db.query(InterviewReport).filter(
        InterviewReport.session_id == session_id
    ).first()
    if existing:
        return {"report": InterviewReportResponse.model_validate(existing).model_dump()}

    messages = (
        db.query(InterviewMessage)
        .filter(InterviewMessage.session_id == session_id)
        .order_by(InterviewMessage.message_order.asc())
        .all()
    )

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No interview messages found",
        )

    chat_messages = [{"role": m.role, "content": m.content} for m in messages]

    async def event_generator():
        try:
            yield f"event: progress\ndata: {json.dumps({'percent': 10, 'status': 'Analyzing transcript...'})}\n\n"

            report_data = await generate_interview_report(session.job_role, chat_messages)

            yield f"event: progress\ndata: {json.dumps({'percent': 80, 'status': 'Building report...'})}\n\n"

            overall_score = report_data.get("overall_score", 50)
            verdict = report_data.get("verdict", "needs_practice")

            report = InterviewReport(
                session_id=session_id,
                user_id=current_user.id,
                report_json=json.dumps(report_data),
                overall_score=overall_score,
                verdict=verdict,
            )
            db.add(report)
            db.commit()
            db.refresh(report)

            yield f"event: progress\ndata: {json.dumps({'percent': 100, 'status': 'Complete'})}\n\n"
            yield f"event: report\ndata: {json.dumps(report_data)}\n\n"
            yield "event: done\ndata: {}\n\n"

        except json.JSONDecodeError:
            yield f"event: error\ndata: {json.dumps({'error': 'Failed to parse analysis. Please try again.'})}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Get report ─────────────────────────────────────────

@router.get(
    "/{session_id}/report",
    response_model=InterviewReportResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_interview_or_404(session_id, current_user.id, db)

    report = db.query(InterviewReport).filter(
        InterviewReport.session_id == session_id,
        InterviewReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. Generate it first.",
        )
    return InterviewReportResponse.model_validate(report)


# ── Download report as PDF ─────────────────────────────

@router.get(
    "/{session_id}/report/pdf",
    responses={404: {"model": ErrorResponse}},
)
def download_report_pdf(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_interview_or_404(session_id, current_user.id, db)

    report = db.query(InterviewReport).filter(
        InterviewReport.session_id == session_id,
        InterviewReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. Generate it first.",
        )

    report_data = json.loads(report.report_json)
    pdf_bytes = generate_interview_pdf(
        user=current_user,
        session=session,
        report_data=report_data,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="iklavya-interview-{session_id[:8]}.pdf"',
        },
    )


# ── TTS proxy ──────────────────────────────────────────

@router.post("/tts")
async def text_to_speech(
    data: InterviewTTSRequest,
    current_user: User = Depends(get_current_user),
):
    import time
    now = time.time()
    uid = current_user.id

    # Rate limit: max TTS_MAX_CALLS_PER_MINUTE per user per minute
    calls = _tts_calls.get(uid, [])
    calls = [t for t in calls if now - t < 60]
    if len(calls) >= TTS_MAX_CALLS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="TTS rate limit exceeded. Please wait a moment.",
        )
    calls.append(now)
    _tts_calls[uid] = calls

    try:
        audio_bytes = await synthesize_speech(data.text)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Length": str(len(audio_bytes))},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"TTS service error: {str(e)}",
        )
