from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import (
    BroadcastQuiz, BroadcastQuizQuestion, BroadcastQuizAttempt,
    User, Notification, utc_now, generate_uuid,
)
from app.auth import get_current_user

router = APIRouter(tags=["broadcast-quiz"])


# ─── Schemas ──────────────────────────────────────────

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str = Field(pattern=r"^[abcd]$")
    explanation: Optional[str] = None


class QuizCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = None
    category: str = Field(default="general", max_length=50)
    time_per_question: int = Field(default=30, ge=10, le=120)
    broadcast_interval_hours: int = Field(default=4, ge=1, le=24)
    questions: list[QuestionCreate] = Field(min_length=2, max_length=10)


class SubmitAnswer(BaseModel):
    answers: dict[str, str]  # {question_id: "a"|"b"|"c"|"d"}


# ─── Admin: Create Quiz + Broadcast ──────────────────

@router.post("/broadcast-quiz")
def create_broadcast_quiz(
    payload: QuizCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a quiz and broadcast notification to all students."""
    quiz = BroadcastQuiz(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        time_per_question=payload.time_per_question,
        broadcast_interval_hours=payload.broadcast_interval_hours,
        created_by=user.id,
        last_broadcast_at=utc_now(),
    )
    db.add(quiz)
    db.flush()

    for i, q in enumerate(payload.questions):
        question = BroadcastQuizQuestion(
            quiz_id=quiz.id,
            question=q.question,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option,
            explanation=q.explanation,
            question_order=i,
        )
        db.add(question)

    # Broadcast notification to ALL students
    students = db.query(User).filter(User.role == "student").all()
    for student in students:
        notif = Notification(
            recipient_type="student",
            recipient_id=student.id,
            type="quiz_broadcast",
            title=f"Live Quiz: {payload.title}",
            message=f"{len(payload.questions)} questions \u00b7 {payload.category.title()} \u00b7 Take it now!",
            link=f"/live-quiz?quiz={quiz.id}",
        )
        db.add(notif)

    db.commit()
    return {
        "id": quiz.id,
        "title": quiz.title,
        "questions": len(payload.questions),
        "students_notified": len(students),
    }


# ─── List Active Quizzes ─────────────────────────────

@router.get("/broadcast-quiz")
def list_broadcast_quizzes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all active broadcast quizzes."""
    quizzes = (
        db.query(BroadcastQuiz)
        .filter(BroadcastQuiz.is_active == 1)
        .order_by(desc(BroadcastQuiz.created_at))
        .all()
    )

    # Get user's attempts
    attempted_ids = set()
    attempts = (
        db.query(BroadcastQuizAttempt)
        .filter(BroadcastQuizAttempt.user_id == user.id)
        .all()
    )
    attempt_map = {}
    for a in attempts:
        attempted_ids.add(a.quiz_id)
        attempt_map[a.quiz_id] = {"score": a.score, "total": a.total}

    result = []
    for q in quizzes:
        qcount = (
            db.query(BroadcastQuizQuestion)
            .filter(BroadcastQuizQuestion.quiz_id == q.id)
            .count()
        )
        item = {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "category": q.category,
            "time_per_question": q.time_per_question,
            "question_count": qcount,
            "total_attempts": q.total_attempts,
            "created_at": q.created_at,
            "attempted": q.id in attempted_ids,
        }
        if q.id in attempt_map:
            item["my_score"] = attempt_map[q.id]["score"]
            item["my_total"] = attempt_map[q.id]["total"]
        result.append(item)

    return {"quizzes": result}


# ─── Get Quiz with Questions ─────────────────────────

@router.get("/broadcast-quiz/{quiz_id}")
def get_broadcast_quiz(
    quiz_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a quiz with its questions (correct answers hidden)."""
    quiz = db.query(BroadcastQuiz).filter(BroadcastQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = (
        db.query(BroadcastQuizQuestion)
        .filter(BroadcastQuizQuestion.quiz_id == quiz_id)
        .order_by(BroadcastQuizQuestion.question_order)
        .all()
    )

    # Check if already attempted
    existing = (
        db.query(BroadcastQuizAttempt)
        .filter(
            BroadcastQuizAttempt.quiz_id == quiz_id,
            BroadcastQuizAttempt.user_id == user.id,
        )
        .first()
    )

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "category": quiz.category,
        "time_per_question": quiz.time_per_question,
        "already_attempted": existing is not None,
        "my_score": existing.score if existing else None,
        "my_total": existing.total if existing else None,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "options": {
                    "a": q.option_a,
                    "b": q.option_b,
                    "c": q.option_c,
                    "d": q.option_d,
                },
                "order": q.question_order,
            }
            for q in questions
        ],
    }


# ─── Submit Quiz ─────────────────────────────────────

@router.post("/broadcast-quiz/{quiz_id}/submit")
def submit_broadcast_quiz(
    quiz_id: str,
    payload: SubmitAnswer,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit answers for a broadcast quiz."""
    quiz = db.query(BroadcastQuiz).filter(BroadcastQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Check duplicate attempt
    existing = (
        db.query(BroadcastQuizAttempt)
        .filter(
            BroadcastQuizAttempt.quiz_id == quiz_id,
            BroadcastQuizAttempt.user_id == user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already attempted this quiz")

    questions = (
        db.query(BroadcastQuizQuestion)
        .filter(BroadcastQuizQuestion.quiz_id == quiz_id)
        .all()
    )

    # Grade
    score = 0
    total = len(questions)
    results = []
    for q in questions:
        user_answer = payload.answers.get(q.id, "")
        is_correct = user_answer.lower() == q.correct_option.lower()
        if is_correct:
            score += 1
        results.append({
            "question_id": q.id,
            "question": q.question,
            "user_answer": user_answer,
            "correct_answer": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "options": {"a": q.option_a, "b": q.option_b, "c": q.option_c, "d": q.option_d},
        })

    import json
    attempt = BroadcastQuizAttempt(
        quiz_id=quiz_id,
        user_id=user.id,
        score=score,
        total=total,
        answers_json=json.dumps(results),
    )
    db.add(attempt)

    # Update total attempts
    quiz.total_attempts = (quiz.total_attempts or 0) + 1
    db.commit()

    return {
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100) if total > 0 else 0,
        "results": results,
    }


# ─── Re-broadcast (reminder) ─────────────────────────

@router.post("/broadcast-quiz/{quiz_id}/rebroadcast")
def rebroadcast_quiz(
    quiz_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Re-broadcast quiz notification to students who haven't attempted it."""
    quiz = db.query(BroadcastQuiz).filter(BroadcastQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Students who already attempted
    attempted_user_ids = set(
        row[0] for row in
        db.query(BroadcastQuizAttempt.user_id)
        .filter(BroadcastQuizAttempt.quiz_id == quiz_id)
        .all()
    )

    # Notify students who haven't attempted
    students = db.query(User).filter(User.role == "student").all()
    notified = 0
    for student in students:
        if student.id not in attempted_user_ids:
            notif = Notification(
                recipient_type="student",
                recipient_id=student.id,
                type="quiz_broadcast",
                title=f"Reminder: {quiz.title}",
                message=f"You haven't taken this quiz yet! Complete it now.",
                link=f"/live-quiz?quiz={quiz.id}",
            )
            db.add(notif)
            notified += 1

    quiz.last_broadcast_at = utc_now()
    db.commit()

    return {"reminded": notified, "already_attempted": len(attempted_user_ids)}


# ─── Admin: List all quizzes (including inactive) ─────

@router.get("/broadcast-quiz/admin/all")
def admin_list_all_quizzes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all quizzes for admin view."""
    quizzes = (
        db.query(BroadcastQuiz)
        .order_by(desc(BroadcastQuiz.created_at))
        .all()
    )
    result = []
    for q in quizzes:
        qcount = (
            db.query(BroadcastQuizQuestion)
            .filter(BroadcastQuizQuestion.quiz_id == q.id)
            .count()
        )
        result.append({
            "id": q.id,
            "title": q.title,
            "category": q.category,
            "question_count": qcount,
            "total_attempts": q.total_attempts,
            "is_active": q.is_active,
            "last_broadcast_at": q.last_broadcast_at,
            "created_at": q.created_at,
        })
    return {"quizzes": result}


# ─── Seed sample quizzes ─────────────────────────────

@router.post("/broadcast-quiz/seed")
def seed_broadcast_quizzes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Seed 4 sample broadcast quizzes with questions and broadcast to all students."""
    existing = db.query(BroadcastQuiz).count()
    if existing > 0:
        return {"message": f"Already have {existing} quizzes. Skipping seed.", "seeded": 0}

    quizzes_data = [
        {
            "title": "Banking Fundamentals",
            "description": "Test your knowledge of core banking operations, KYC norms, and financial regulations.",
            "category": "banking",
            "questions": [
                {
                    "question": "What does KYC stand for in banking?",
                    "option_a": "Keep Your Cash",
                    "option_b": "Know Your Customer",
                    "option_c": "Key Yearly Compliance",
                    "option_d": "Know Your Credit",
                    "correct_option": "b",
                    "explanation": "KYC (Know Your Customer) is the process of verifying the identity of clients as per RBI guidelines.",
                },
                {
                    "question": "Which of these is NOT a type of bank account?",
                    "option_a": "Current Account",
                    "option_b": "Savings Account",
                    "option_c": "Demat Account",
                    "option_d": "Investment Account",
                    "correct_option": "d",
                    "explanation": "Investment Account is not a standard bank account type. Demat accounts hold securities, not cash.",
                },
                {
                    "question": "What is the full form of NEFT?",
                    "option_a": "National Electronic Funds Transfer",
                    "option_b": "New Electronic Financial Transaction",
                    "option_c": "National E-Fund Transfer",
                    "option_d": "Net Electronic Funds Transfer",
                    "correct_option": "a",
                    "explanation": "NEFT is a nationwide payment system facilitating one-to-one funds transfer.",
                },
                {
                    "question": "The base rate of lending is determined by which institution?",
                    "option_a": "SEBI",
                    "option_b": "RBI",
                    "option_c": "NABARD",
                    "option_d": "Ministry of Finance",
                    "correct_option": "b",
                    "explanation": "The Reserve Bank of India (RBI) sets monetary policy and determines the repo rate which influences base lending rates.",
                },
                {
                    "question": "What is the minimum amount for an RTGS transaction?",
                    "option_a": "₹1,000",
                    "option_b": "₹5,000",
                    "option_c": "₹2,00,000",
                    "option_d": "₹50,000",
                    "correct_option": "c",
                    "explanation": "RTGS (Real Time Gross Settlement) requires a minimum transfer of ₹2,00,000.",
                },
            ],
        },
        {
            "title": "Communication Skills Challenge",
            "description": "How well do you communicate? Test your knowledge of professional communication.",
            "category": "communication",
            "questions": [
                {
                    "question": "In a job interview, what is the recommended duration for your self-introduction?",
                    "option_a": "30 seconds",
                    "option_b": "1-2 minutes",
                    "option_c": "5 minutes",
                    "option_d": "As long as needed",
                    "correct_option": "b",
                    "explanation": "A concise 1-2 minute self-introduction covers key points without losing the interviewer's attention.",
                },
                {
                    "question": "Which of these is an example of active listening?",
                    "option_a": "Checking your phone while nodding",
                    "option_b": "Interrupting to share your opinion",
                    "option_c": "Paraphrasing what the speaker said",
                    "option_d": "Waiting for your turn to speak",
                    "correct_option": "c",
                    "explanation": "Paraphrasing demonstrates that you understood and processed what was said.",
                },
                {
                    "question": "What does the 7-38-55 rule in communication state?",
                    "option_a": "7% written, 38% verbal, 55% visual",
                    "option_b": "7% words, 38% tone, 55% body language",
                    "option_c": "7% email, 38% phone, 55% face-to-face",
                    "option_d": "7% formal, 38% informal, 55% nonverbal",
                    "correct_option": "b",
                    "explanation": "Albert Mehrabian's rule: 7% of communication is words, 38% is tone of voice, and 55% is body language.",
                },
                {
                    "question": "Which email sign-off is most appropriate for a formal business email?",
                    "option_a": "Cheers",
                    "option_b": "Best regards",
                    "option_c": "XOXO",
                    "option_d": "Sent from my iPhone",
                    "correct_option": "b",
                    "explanation": "\"Best regards\" is the standard professional email sign-off in business communication.",
                },
            ],
        },
        {
            "title": "Aptitude Quick Fire",
            "description": "Sharpen your quantitative and logical reasoning skills with these rapid-fire questions.",
            "category": "aptitude",
            "questions": [
                {
                    "question": "A train travels 360 km in 4 hours. What is its speed in m/s?",
                    "option_a": "25 m/s",
                    "option_b": "90 m/s",
                    "option_c": "15 m/s",
                    "option_d": "36 m/s",
                    "correct_option": "a",
                    "explanation": "360 km / 4 hours = 90 km/h. Converting: 90 × (5/18) = 25 m/s.",
                },
                {
                    "question": "If 8 workers can build a wall in 10 days, how many days will 5 workers take?",
                    "option_a": "12 days",
                    "option_b": "14 days",
                    "option_c": "16 days",
                    "option_d": "20 days",
                    "correct_option": "c",
                    "explanation": "Total work = 8 × 10 = 80 worker-days. With 5 workers: 80 / 5 = 16 days.",
                },
                {
                    "question": "What comes next in the series: 2, 6, 12, 20, 30, ?",
                    "option_a": "40",
                    "option_b": "42",
                    "option_c": "38",
                    "option_d": "44",
                    "correct_option": "b",
                    "explanation": "Differences: 4, 6, 8, 10, 12. Pattern: n(n+1). Next: 6×7 = 42.",
                },
                {
                    "question": "A shopkeeper gives 20% discount on marked price and still earns 25% profit. If the cost price is ₹400, what is the marked price?",
                    "option_a": "₹500",
                    "option_b": "₹600",
                    "option_c": "₹625",
                    "option_d": "₹550",
                    "correct_option": "c",
                    "explanation": "SP = 400 × 1.25 = ₹500. If 80% of MP = 500, then MP = 500/0.8 = ₹625.",
                },
                {
                    "question": "In how many ways can 5 people sit around a circular table?",
                    "option_a": "120",
                    "option_b": "24",
                    "option_c": "60",
                    "option_d": "20",
                    "correct_option": "b",
                    "explanation": "Circular permutation = (n-1)! = 4! = 24.",
                },
            ],
        },
        {
            "title": "Indian Economy & Current Affairs",
            "description": "Stay updated with the latest in Indian economic policy and financial news.",
            "category": "general",
            "questions": [
                {
                    "question": "What is the primary objective of NABARD?",
                    "option_a": "Regulating stock markets",
                    "option_b": "Financing rural and agricultural development",
                    "option_c": "Managing foreign exchange",
                    "option_d": "Issuing currency notes",
                    "correct_option": "b",
                    "explanation": "NABARD (National Bank for Agriculture and Rural Development) focuses on rural credit and agriculture financing.",
                },
                {
                    "question": "Which scheme provides ₹2 lakh insurance cover to Jan Dhan account holders?",
                    "option_a": "Atal Pension Yojana",
                    "option_b": "PM Jeevan Jyoti Bima",
                    "option_c": "PM Suraksha Bima Yojana",
                    "option_d": "PM Jan Dhan Yojana",
                    "correct_option": "d",
                    "explanation": "PM Jan Dhan Yojana provides an accidental insurance cover of ₹2 lakh to account holders.",
                },
                {
                    "question": "What does SLR stand for in banking?",
                    "option_a": "Standard Lending Rate",
                    "option_b": "Statutory Liquidity Ratio",
                    "option_c": "Special Loan Reserve",
                    "option_d": "Systematic Liability Ratio",
                    "correct_option": "b",
                    "explanation": "SLR is the percentage of deposits that banks must maintain in liquid assets like gold, government securities, etc.",
                },
                {
                    "question": "India's fiscal year runs from:",
                    "option_a": "January to December",
                    "option_b": "April to March",
                    "option_c": "July to June",
                    "option_d": "October to September",
                    "correct_option": "b",
                    "explanation": "India's fiscal year starts on April 1st and ends on March 31st.",
                },
            ],
        },
    ]

    students = db.query(User).filter(User.role == "student").all()
    seeded = 0

    for qdata in quizzes_data:
        quiz = BroadcastQuiz(
            title=qdata["title"],
            description=qdata["description"],
            category=qdata["category"],
            time_per_question=30,
            broadcast_interval_hours=4,
            created_by=user.id,
            last_broadcast_at=utc_now(),
        )
        db.add(quiz)
        db.flush()

        for i, q in enumerate(qdata["questions"]):
            question = BroadcastQuizQuestion(
                quiz_id=quiz.id,
                question=q["question"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=q["correct_option"],
                explanation=q.get("explanation"),
                question_order=i,
            )
            db.add(question)

        # Broadcast to all students
        for student in students:
            notif = Notification(
                recipient_type="student",
                recipient_id=student.id,
                type="quiz_broadcast",
                title=f"Live Quiz: {qdata['title']}",
                message=f"{len(qdata['questions'])} questions \u00b7 {qdata['category'].title()} \u00b7 Take it now!",
                link=f"/live-quiz?quiz={quiz.id}",
            )
            db.add(notif)

        seeded += 1

    db.commit()
    return {"seeded": seeded, "students_notified": len(students)}
