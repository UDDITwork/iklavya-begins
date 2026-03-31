import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    college: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="student"
    )
    profile_image: Mapped[str] = mapped_column(String(500), nullable=True)
    profile_completed: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    reset_token: Mapped[str] = mapped_column(String(100), nullable=True)
    reset_token_expiry: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True
    )
    date_of_birth: Mapped[str] = mapped_column(String(20), nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    pin_code: Mapped[str] = mapped_column(String(10), nullable=True)
    education_level: Mapped[str] = mapped_column(String(50), nullable=True)
    class_or_year: Mapped[str] = mapped_column(String(20), nullable=True)
    institution: Mapped[str] = mapped_column(String(200), nullable=True)
    board: Mapped[str] = mapped_column(String(50), nullable=True)
    stream: Mapped[str] = mapped_column(String(100), nullable=True)
    cgpa: Mapped[str] = mapped_column(String(10), nullable=True)
    parent_occupation: Mapped[str] = mapped_column(String(100), nullable=True)
    siblings: Mapped[str] = mapped_column(String(10), nullable=True)
    income_range: Mapped[str] = mapped_column(String(50), nullable=True)
    hobbies: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array string
    interests: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array string
    strengths: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array string
    weaknesses: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array string
    languages: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array string
    career_aspiration_raw: Mapped[str] = mapped_column(Text, nullable=True)
    # Professional / career fields
    linkedin_url: Mapped[str] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str] = mapped_column(String(500), nullable=True)
    work_experience: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    projects: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    certifications: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    skills: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    achievements: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    extracurriculars: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


class ChatSession(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="New Session")
    started_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    ended_at: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active, completed
    session_summary: Mapped[str] = mapped_column(Text, nullable=True)
    questions_asked_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    analysis_generated: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )  # 0 or 1 (boolean as int for SQLite)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class SessionAnalysis(Base):
    __tablename__ = "session_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id"), nullable=False, unique=True, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    analysis_json: Mapped[str] = mapped_column(Text, nullable=True)
    analysis_markdown: Mapped[str] = mapped_column(Text, nullable=True)
    roadmap_json: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class ContextSummary(Base):
    __tablename__ = "context_summaries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True
    )
    cumulative_summary: Mapped[str] = mapped_column(Text, nullable=True)
    last_updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


# ─── Resume Builder ────────────────────────────────────────


class ResumeSession(Base):
    __tablename__ = "resume_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="New Resume")
    started_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    ended_at: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active, completed
    message_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    template: Mapped[str] = mapped_column(
        String(30), nullable=False, default="professional"
    )


class ResumeMessage(Base):
    __tablename__ = "resume_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_sessions.id"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_sessions.id"), nullable=False, unique=True, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    resume_json: Mapped[str] = mapped_column(Text, nullable=False)
    template: Mapped[str] = mapped_column(
        String(30), nullable=False, default="professional"
    )
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


class ResumeDraft(Base):
    __tablename__ = "resume_drafts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(
        String(200), nullable=False, default="Untitled Resume"
    )
    resume_json: Mapped[str] = mapped_column(
        Text, nullable=False, default="{}"
    )
    template: Mapped[str] = mapped_column(
        String(30), nullable=False, default="professional"
    )
    source: Mapped[str] = mapped_column(
        String(20), nullable=False, default="scratch"
    )  # scratch, upload, chat
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_sessions.id"), nullable=True
    )
    ats_score: Mapped[int] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, completed
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


# ─── Classroom ────────────────────────────────────────────


class CourseModule(Base):
    __tablename__ = "course_modules"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=True, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    video_url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(
        Integer, nullable=False, default=600
    )  # 10 minutes default
    category: Mapped[str] = mapped_column(
        String(100), nullable=False, default="soft-skills"
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_published: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )  # 0 or 1
    segments_json: Mapped[str] = mapped_column(
        Text, nullable=True
    )  # JSON: [{title, start_sec, end_sec}]
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class ModuleQuiz(Base):
    __tablename__ = "module_quizzes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    module_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("course_modules.id"), nullable=False, index=True
    )
    trigger_at_seconds: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # 150, 300, 450
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # JSON: ["Option A", "Option B", ...]
    correct_index: Mapped[int] = mapped_column(Integer, nullable=False)
    hint: Mapped[str] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


# ─── Job Feed ────────────────────────────────────────────


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=True)
    salary: Mapped[str] = mapped_column(String(100), nullable=True)
    job_type: Mapped[str] = mapped_column(String(50), nullable=True)  # Full-time, Part-time, etc.
    experience: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    requirements_json: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    tags_json: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    role_category: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # sales, receptionist, admin, etc.
    source_url: Mapped[str] = mapped_column(String(500), nullable=True)
    source_name: Mapped[str] = mapped_column(String(100), nullable=True)
    apply_link: Mapped[str] = mapped_column(String(500), nullable=True)
    posted_at: Mapped[str] = mapped_column(String(50), nullable=True)
    scraped_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )

    # ── Filterable columns (populated at scrape time) ──
    salary_min: Mapped[int] = mapped_column(Integer, nullable=True)  # INR per month
    salary_max: Mapped[int] = mapped_column(Integer, nullable=True)
    experience_min: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    experience_max: Mapped[int] = mapped_column(Integer, nullable=True)
    job_type_enum: Mapped[str] = mapped_column(
        String(30), nullable=True
    )  # full-time, part-time, wfh, contract, internship
    is_remote: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    scrape_batch_id: Mapped[str] = mapped_column(String(36), nullable=True)


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="applied"
    )  # applied, saved
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class UserModuleProgress(Base):
    __tablename__ = "user_module_progress"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    module_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("course_modules.id"), nullable=False, index=True
    )
    last_position_seconds: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    quizzes_passed_json: Mapped[str] = mapped_column(
        Text, nullable=True
    )  # JSON: [150, 300] = quiz timestamps passed
    is_completed: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )  # 0 or 1
    score: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )  # total correct answers
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


# ─── Mentors ─────────────────────────────────────────────


class Mentor(Base):
    __tablename__ = "mentors"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    specialization: Mapped[str] = mapped_column(String(200), nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    profile_image: Mapped[str] = mapped_column(String(500), nullable=True)
    expertise_json: Mapped[str] = mapped_column(
        Text, nullable=True
    )  # JSON array: ["Resume Building", "Interview Prep"]
    linkedin_url: Mapped[str] = mapped_column(String(500), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=True)
    is_verified: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )  # 0 = pending, 1 = admin-verified
    is_available: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )  # 0 = unavailable, 1 = available
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


# ─── Assessments & Certificates ──────────────────────────


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    module_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("course_modules.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    time_limit_seconds: Mapped[int] = mapped_column(
        Integer, nullable=False, default=600
    )  # 10 minutes
    pass_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=15
    )  # out of 25
    total_questions: Mapped[int] = mapped_column(
        Integer, nullable=False, default=25
    )
    retry_cooldown_hours: Mapped[int] = mapped_column(
        Integer, nullable=False, default=24
    )
    is_published: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )  # 0 or 1
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False, index=True
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # JSON: ["Option A", "Option B", "Option C", "Option D"]
    correct_index: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class UserAssessment(Base):
    __tablename__ = "user_assessments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False, index=True
    )
    started_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    submitted_at: Mapped[str] = mapped_column(String(50), nullable=True)
    answers_json: Mapped[str] = mapped_column(
        Text, nullable=True
    )  # JSON: [{question_id, selected_index}]
    score: Mapped[int] = mapped_column(Integer, nullable=True)
    passed: Mapped[int] = mapped_column(
        Integer, nullable=True
    )  # 0 or 1, null until submitted
    time_taken_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="in_progress"
    )  # in_progress, submitted, expired


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    cert_number: Mapped[str] = mapped_column(
        String(20), nullable=False, unique=True, index=True
    )  # IKL-2026-A7X9K2
    cert_slug: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )  # 80-char URL-safe random string
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    user_assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_assessments.id"), nullable=False, unique=True
    )
    module_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("course_modules.id"), nullable=False
    )
    cert_data_json: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # Denormalized JSON blob with all rendering data
    issued_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


# ─── Mentor Sessions (Bidirectional Chat) ───────────────


class MentorSession(Base):
    __tablename__ = "mentor_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    mentor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("mentors.id"), nullable=False, index=True
    )
    topic: Mapped[str] = mapped_column(String(300), nullable=False)
    student_message: Mapped[str] = mapped_column(Text, nullable=True)
    preferred_date: Mapped[str] = mapped_column(String(50), nullable=True)
    preferred_time: Mapped[str] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="requested"
    )  # requested, accepted, rejected, completed
    mentor_note: Mapped[str] = mapped_column(Text, nullable=True)
    student_last_read_at: Mapped[str] = mapped_column(String(50), nullable=True)
    mentor_last_read_at: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
    updated_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now, onupdate=utc_now
    )


class MentorMessage(Base):
    __tablename__ = "mentor_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("mentor_sessions.id"), nullable=False, index=True
    )
    sender_type: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # "student" or "mentor"
    sender_id: Mapped[str] = mapped_column(String(36), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )


# ─── Notifications ──────────────────────────────────────


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    recipient_type: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # "student" or "mentor"
    recipient_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # mentor_reply, session_accepted, session_rejected, cert_earned, assessment_passed, assessment_failed, system
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=True)
    link: Mapped[str] = mapped_column(String(300), nullable=True)
    is_read: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )  # 0 or 1
    created_at: Mapped[str] = mapped_column(
        String(50), nullable=False, default=utc_now
    )
