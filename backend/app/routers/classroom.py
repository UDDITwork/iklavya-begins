import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, CourseModule, ModuleQuiz, UserModuleProgress
from app.schemas import (
    CourseModuleResponse,
    CourseModuleListResponse,
    ModuleQuizResponse,
    ModuleDetailResponse,
    UserProgressResponse,
    ProgressSyncRequest,
    QuizAnswerRequest,
    QuizAnswerResponse,
    ErrorResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/modules", tags=["classroom"])


@router.get("", response_model=CourseModuleListResponse)
def list_modules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    modules = (
        db.query(CourseModule)
        .filter(CourseModule.is_published == 1)
        .order_by(CourseModule.order_index.asc())
        .all()
    )
    return CourseModuleListResponse(
        modules=[CourseModuleResponse.model_validate(m) for m in modules]
    )


# NOTE: seed/init and progress/all must be defined BEFORE /{module_id}
# to prevent FastAPI from matching "seed" or "progress" as a module_id.


@router.get(
    "/seed/init",
    responses={200: {"description": "Seed data created"}},
)
def seed_modules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Seed initial course modules and quizzes. Only works if no modules exist."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    existing = db.query(CourseModule).count()
    if existing > 0:
        return {"message": f"Already have {existing} modules, skipping seed"}

    modules_data = [
        {
            "title": "Time Management for Young Professionals",
            "slug": "time-management",
            "description": "Master the art of managing your time effectively as you transition from college life to the professional world. Learn proven frameworks like Deep Work, the Pareto Principle, the Eisenhower Matrix, and the Pomodoro Technique.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/time-management.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/time-management-thumb.jpg",
            "duration_seconds": 600,
            "category": "Productivity",
            "order_index": 0,
            "segments_json": json.dumps([
                {"title": "Deep Work & The Pareto Principle", "start_sec": 0, "end_sec": 150},
                {"title": "The Eisenhower Matrix", "start_sec": 150, "end_sec": 300},
                {"title": "The Pomodoro Technique", "start_sec": 300, "end_sec": 450},
                {"title": "The Art of Saying No", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "According to the Pareto Principle, what percentage of your results come from 20% of your efforts?",
                    "options": ["50%", "60%", "80%", "90%"],
                    "correct_index": 2,
                    "hint": "Think 80/20 — the principle is named after this ratio!",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "If a task is Urgent but NOT Important, where does it go in the Eisenhower Matrix?",
                    "options": ["Do", "Delegate", "Delete", "Schedule"],
                    "correct_index": 1,
                    "hint": "Urgent but not important tasks should be handed off to someone else.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "In the Pomodoro Technique, how long is one focus session?",
                    "options": ["15 minutes", "25 minutes", "30 minutes", "45 minutes"],
                    "correct_index": 1,
                    "hint": "It's named after a tomato-shaped kitchen timer — think short, focused bursts.",
                },
            ],
        },
        {
            "title": "Workplace Etiquette for Indian Professionals",
            "slug": "workplace-etiquette",
            "description": "Navigate the corporate world — from email hygiene and meeting discipline to giving & receiving feedback professionally.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/workplace-etiquette.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/workplace-etiquette-thumb.jpg",
            "duration_seconds": 600,
            "category": "Professional Skills",
            "order_index": 1,
            "segments_json": json.dumps([
                {"title": "First Impressions That Last", "start_sec": 0, "end_sec": 150},
                {"title": "Meeting Discipline & Professional Behavior", "start_sec": 150, "end_sec": 300},
                {"title": "Giving & Receiving Feedback", "start_sec": 300, "end_sec": 450},
                {"title": "Digital Citizenship at Work", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What is the most professional way to start a formal email?",
                    "options": ["Hey!", "Hi there,", "Dear [Name],", "Yo,"],
                    "correct_index": 2,
                    "hint": "In formal contexts, using 'Dear' followed by the recipient's name is standard.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "During a virtual meeting, what should you do when someone else is speaking?",
                    "options": ["Mute yourself and listen actively", "Check your phone", "Type in the chat", "Interrupt with your point"],
                    "correct_index": 0,
                    "hint": "Active listening means giving your full, undivided attention.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What is the best response to constructive criticism from your manager?",
                    "options": ["Get defensive", "Ignore it completely", "Thank them and ask for specifics", "Complain to colleagues"],
                    "correct_index": 2,
                    "hint": "Feedback is a gift — showing gratitude and seeking clarity shows maturity.",
                },
            ],
        },
        {
            "title": "Social Communication Skills",
            "slug": "social-communication",
            "description": "From active listening to assertiveness — learn the art of connection, networking, and voicing your opinion without conflict.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/social-communication.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/social-communication-thumb.jpg",
            "duration_seconds": 600,
            "category": "Communication",
            "order_index": 2,
            "segments_json": json.dumps([
                {"title": "Active Listening — The Most Underrated Skill", "start_sec": 0, "end_sec": 150},
                {"title": "Non-Verbal Communication Cues", "start_sec": 150, "end_sec": 300},
                {"title": "The Art of Small Talk", "start_sec": 300, "end_sec": 450},
                {"title": "Assertive Communication", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What is 'mirroring' in the context of active listening?",
                    "options": ["Copying someone's accent", "Reflecting back what someone said", "Looking at a mirror while talking", "Repeating your own points"],
                    "correct_index": 1,
                    "hint": "Mirroring shows the speaker you've understood by paraphrasing their message.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "Which body language signal indicates openness and confidence?",
                    "options": ["Crossed arms", "Avoiding eye contact", "Open palms and steady eye contact", "Fidgeting"],
                    "correct_index": 2,
                    "hint": "Open, relaxed posture and eye contact show you're engaged and confident.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What does the FORD framework stand for in small talk?",
                    "options": ["Facts, Opinions, Remarks, Details", "Family, Occupation, Recreation, Dreams", "Friendly, Open, Relaxed, Direct", "Focus, Observe, Respond, Discuss"],
                    "correct_index": 1,
                    "hint": "These are four safe, universal topics for professional conversations.",
                },
            ],
        },
        {
            "title": "Resume & Interview Mastery",
            "slug": "resume-interview-mastery",
            "description": "Learn to craft ATS-friendly resumes, ace interviews using the STAR method, avoid common mistakes, and confidently negotiate your salary.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/resume-interview-mastery.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/resume-interview-mastery-thumb.jpg",
            "duration_seconds": 600,
            "category": "Career Development",
            "order_index": 3,
            "segments_json": json.dumps([
                {"title": "Building an ATS-Friendly Resume", "start_sec": 0, "end_sec": 150},
                {"title": "The STAR Method for Interviews", "start_sec": 150, "end_sec": 300},
                {"title": "Common Interview Mistakes to Avoid", "start_sec": 300, "end_sec": 450},
                {"title": "Salary Negotiation for Freshers", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What percentage of resumes are typically rejected by ATS before a human sees them?",
                    "options": ["25%", "50%", "75%", "90%"],
                    "correct_index": 2,
                    "hint": "It is a shockingly high number — which is why ATS optimization matters so much.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "What does STAR stand for in the interview context?",
                    "options": ["Skills, Training, Attitude, Results", "Situation, Task, Action, Result", "Summary, Technique, Approach, Review", "Strengths, Targets, Actions, Reflection"],
                    "correct_index": 1,
                    "hint": "It is a storytelling framework that keeps your answers structured and concise.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "When should you first discuss salary in the interview process?",
                    "options": ["In the very first interview", "In your cover letter", "After receiving an offer or strong hiring signal", "Never — accept what is offered"],
                    "correct_index": 2,
                    "hint": "You have the most leverage at a specific point in the process — think about when that is.",
                },
            ],
        },
        {
            "title": "Financial Literacy for Freshers",
            "slug": "financial-literacy-freshers",
            "description": "Your first salary is exciting — make it count. Learn practical budgeting, understand PF and taxes, discover saving vs investing, and protect yourself from common debt traps.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/financial-literacy-freshers.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/financial-literacy-freshers-thumb.jpg",
            "duration_seconds": 600,
            "category": "Personal Finance",
            "order_index": 4,
            "segments_json": json.dumps([
                {"title": "Budgeting Your First Salary", "start_sec": 0, "end_sec": 150},
                {"title": "Understanding PF, Taxes & Your Payslip", "start_sec": 150, "end_sec": 300},
                {"title": "Saving vs Investing — Know the Difference", "start_sec": 300, "end_sec": 450},
                {"title": "Avoiding Debt Traps", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "In the 50-30-20 budgeting rule, what does the 20% represent?",
                    "options": ["Rent and utilities", "Entertainment", "Savings and Investments", "EMI payments"],
                    "correct_index": 2,
                    "hint": "This portion is non-negotiable and should be auto-debited on salary day.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "What is the employer EPF contribution rate as a percentage of your basic salary?",
                    "options": ["5%", "8%", "10%", "12%"],
                    "correct_index": 3,
                    "hint": "The employer matches what is deducted from your salary — same percentage.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What should you build before you start investing in mutual funds or stocks?",
                    "options": ["A diversified stock portfolio", "An emergency fund of 3-6 months of expenses", "A credit card with a high limit", "A fixed deposit of Rs 10 lakhs"],
                    "correct_index": 1,
                    "hint": "This is your safety net for unexpected events — job loss, medical emergencies, etc.",
                },
            ],
        },
        {
            "title": "Leadership & Teamwork",
            "slug": "leadership-teamwork",
            "description": "You do not need a title to lead. Learn how to influence without authority, resolve conflicts constructively, delegate effectively, and build trust within your team.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/leadership-teamwork.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/leadership-teamwork-thumb.jpg",
            "duration_seconds": 600,
            "category": "Professional Skills",
            "order_index": 5,
            "segments_json": json.dumps([
                {"title": "Leading Without Authority", "start_sec": 0, "end_sec": 150},
                {"title": "Conflict Resolution in Teams", "start_sec": 150, "end_sec": 300},
                {"title": "The Art of Delegation", "start_sec": 300, "end_sec": 450},
                {"title": "Building Trust in Teams", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What is the fastest way for a fresher to demonstrate leadership without a formal title?",
                    "options": ["Wait to be assigned leadership responsibilities", "Identify problems proactively and propose solutions", "Tell others what to do in meetings", "Apply for a team lead position immediately"],
                    "correct_index": 1,
                    "hint": "Leadership without authority starts with initiative and taking ownership of problems.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "When you and a teammate cannot resolve a technical disagreement, what is the best approach to escalation?",
                    "options": ["Complain to your manager privately", "Send an email to the entire team", "Go to the team lead together and ask for input", "Drop the issue and go with whatever the other person wants"],
                    "correct_index": 2,
                    "hint": "The key is approaching the escalation as a team, not as opponents.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "According to Patrick Lencioni, what is the number one dysfunction of a team?",
                    "options": ["Lack of clear goals", "Absence of vulnerability-based trust", "Too many meetings", "Poor technical skills"],
                    "correct_index": 1,
                    "hint": "It all starts with the foundation — the willingness to be open and honest with each other.",
                },
            ],
        },
        {
            "title": "Digital Skills & Personal Branding",
            "slug": "digital-skills-personal-branding",
            "description": "In the digital age, your online presence is your first impression. Learn to optimize LinkedIn, build a killer portfolio, contribute to open source, and craft a personal brand that opens doors.",
            "video_url": "https://res.cloudinary.com/dr17ap4sb/video/upload/v1/classroom/digital-skills-personal-branding.mp4",
            "thumbnail_url": "https://res.cloudinary.com/dr17ap4sb/image/upload/v1/classroom/digital-skills-personal-branding-thumb.jpg",
            "duration_seconds": 600,
            "category": "Career Development",
            "order_index": 6,
            "segments_json": json.dumps([
                {"title": "LinkedIn Optimization for Indian Professionals", "start_sec": 0, "end_sec": 150},
                {"title": "Building a Portfolio That Gets Noticed", "start_sec": 150, "end_sec": 300},
                {"title": "GitHub & Open-Source Contributions", "start_sec": 300, "end_sec": 450},
                {"title": "Personal Brand Strategy", "start_sec": 450, "end_sec": 600},
            ]),
            "quizzes": [
                {
                    "trigger_at_seconds": 150,
                    "question": "What should your LinkedIn headline contain instead of just 'Fresher' or 'Student'?",
                    "options": ["Your college name and graduation year", "A motivational quote", "Keywords showcasing your skills and value proposition", "Your phone number for recruiters"],
                    "correct_index": 2,
                    "hint": "Your headline appears in search results — think about what would make a recruiter click.",
                },
                {
                    "trigger_at_seconds": 300,
                    "question": "What makes a portfolio project stand out to hiring managers?",
                    "options": ["Using the latest and most trendy framework", "Having the most lines of code", "Solving a real problem with actual users and documented impact", "Having a colorful and animated user interface"],
                    "correct_index": 2,
                    "hint": "Companies hire people who can identify and solve real-world problems.",
                },
                {
                    "trigger_at_seconds": 450,
                    "question": "What is a good first step for contributing to open-source projects?",
                    "options": ["Rewrite the entire codebase of a major project", "Fork a popular repository and add your name to the README", "Start with documentation fixes and issues labeled 'good-first-issue'", "Build your own programming language from scratch"],
                    "correct_index": 2,
                    "hint": "Start small and manageable — there are labels specifically for beginners.",
                },
            ],
        },
    ]

    for mod_data in modules_data:
        quizzes = mod_data.pop("quizzes")
        module = CourseModule(**mod_data)
        db.add(module)
        db.flush()

        for idx, quiz_data in enumerate(quizzes):
            quiz = ModuleQuiz(
                module_id=module.id,
                trigger_at_seconds=quiz_data["trigger_at_seconds"],
                question=quiz_data["question"],
                options_json=json.dumps(quiz_data["options"]),
                correct_index=quiz_data["correct_index"],
                hint=quiz_data["hint"],
                order_index=idx,
            )
            db.add(quiz)

    db.commit()
    return {"message": f"Seeded {len(modules_data)} modules with quizzes"}


@router.get("/progress/all", response_model=list[UserProgressResponse])
def get_all_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_list = (
        db.query(UserModuleProgress)
        .filter(UserModuleProgress.user_id == current_user.id)
        .all()
    )
    return [UserProgressResponse.model_validate(p) for p in progress_list]


@router.get(
    "/{module_id}",
    response_model=ModuleDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_module(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    module = db.query(CourseModule).filter(
        CourseModule.id == module_id,
        CourseModule.is_published == 1,
    ).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    quizzes = (
        db.query(ModuleQuiz)
        .filter(ModuleQuiz.module_id == module_id)
        .order_by(ModuleQuiz.trigger_at_seconds.asc())
        .all()
    )

    # Strip correct_index from quiz responses (don't leak answers to frontend)
    quiz_responses = []
    for q in quizzes:
        qr = ModuleQuizResponse.model_validate(q)
        quiz_responses.append(qr)

    return ModuleDetailResponse(
        module=CourseModuleResponse.model_validate(module),
        quizzes=quiz_responses,
    )


@router.get(
    "/{module_id}/progress",
    response_model=UserProgressResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_progress(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.query(UserModuleProgress).filter(
        UserModuleProgress.user_id == current_user.id,
        UserModuleProgress.module_id == module_id,
    ).first()
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this module",
        )
    return UserProgressResponse.model_validate(progress)


@router.post(
    "/sync",
    response_model=UserProgressResponse,
)
def sync_progress(
    data: ProgressSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify module exists
    module = db.query(CourseModule).filter(
        CourseModule.id == data.module_id
    ).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    # Upsert progress
    progress = db.query(UserModuleProgress).filter(
        UserModuleProgress.user_id == current_user.id,
        UserModuleProgress.module_id == data.module_id,
    ).first()

    if not progress:
        progress = UserModuleProgress(
            user_id=current_user.id,
            module_id=data.module_id,
            last_position_seconds=data.last_position_seconds,
            quizzes_passed_json=data.quizzes_passed_json,
            score=data.score or 0,
            is_completed=data.is_completed or 0,
        )
        db.add(progress)
    else:
        # Only update position forward (don't regress)
        if data.last_position_seconds > progress.last_position_seconds:
            progress.last_position_seconds = data.last_position_seconds
        if data.quizzes_passed_json:
            progress.quizzes_passed_json = data.quizzes_passed_json
        if data.score is not None and data.score > progress.score:
            progress.score = data.score
        if data.is_completed == 1:
            progress.is_completed = 1

    db.commit()
    db.refresh(progress)

    return UserProgressResponse.model_validate(progress)


@router.post(
    "/quiz/answer",
    response_model=QuizAnswerResponse,
    responses={404: {"model": ErrorResponse}},
)
def answer_quiz(
    data: QuizAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(ModuleQuiz).filter(
        ModuleQuiz.id == data.quiz_id
    ).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    is_correct = data.selected_index == quiz.correct_index

    return QuizAnswerResponse(
        correct=is_correct,
        correct_index=quiz.correct_index,
        hint=quiz.hint if not is_correct else None,
    )
