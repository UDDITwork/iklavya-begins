from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ─── Auth ────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)
    college: str = Field(min_length=2, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    college: str
    role: str
    profile_image: Optional[str] = None
    profile_completed: int = 0
    created_at: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


class ErrorResponse(BaseModel):
    error: str


# ─── Profile ─────────────────────────────────────────────────

class ProfileCreateRequest(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    education_level: Optional[str] = None
    class_or_year: Optional[str] = None
    institution: Optional[str] = None
    board: Optional[str] = None
    stream: Optional[str] = None
    cgpa: Optional[str] = None
    parent_occupation: Optional[str] = None
    siblings: Optional[str] = None
    income_range: Optional[str] = None
    hobbies: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None
    languages: Optional[list[str]] = None
    career_aspiration_raw: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    work_experience: Optional[list] = None
    projects: Optional[list] = None
    certifications: Optional[list] = None
    skills: Optional[list[str]] = None
    achievements: Optional[list[str]] = None
    extracurriculars: Optional[list[str]] = None
    summary: Optional[str] = None


class ProfileUpdateRequest(ProfileCreateRequest):
    pass


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    education_level: Optional[str] = None
    class_or_year: Optional[str] = None
    institution: Optional[str] = None
    board: Optional[str] = None
    stream: Optional[str] = None
    cgpa: Optional[str] = None
    parent_occupation: Optional[str] = None
    siblings: Optional[str] = None
    income_range: Optional[str] = None
    hobbies: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None
    languages: Optional[list[str]] = None
    career_aspiration_raw: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    work_experience: Optional[list] = None
    projects: Optional[list] = None
    certifications: Optional[list] = None
    skills: Optional[list[str]] = None
    achievements: Optional[list[str]] = None
    extracurriculars: Optional[list[str]] = None
    summary: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


# ─── Sessions ────────────────────────────────────────────────

class SessionCreateRequest(BaseModel):
    title: Optional[str] = Field(default="New Session", max_length=200)


class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    started_at: str
    ended_at: Optional[str] = None
    status: str
    session_summary: Optional[str] = None
    questions_asked_count: int
    analysis_generated: int

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]


# ─── Messages ────────────────────────────────────────────────

class MessageSendRequest(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    role: str
    content: str
    message_order: int
    created_at: str

    model_config = {"from_attributes": True}


class SessionDetailResponse(BaseModel):
    session: SessionResponse
    messages: list[MessageResponse]


# ─── Analysis ────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    analysis_json: Optional[str] = None
    analysis_markdown: Optional[str] = None
    roadmap_json: Optional[str] = None
    created_at: str

    model_config = {"from_attributes": True}


# ─── Resume Builder ─────────────────────────────────────────

class ResumeSessionCreateRequest(BaseModel):
    title: Optional[str] = Field(default="New Resume", max_length=200)
    template: Optional[str] = Field(
        default="professional",
        pattern=r"^(professional|modern|simple|rendercv|sidebar|jake)$",
    )


class ResumeSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    started_at: str
    ended_at: Optional[str] = None
    status: str
    message_count: int
    template: str = "professional"

    model_config = {"from_attributes": True}


class ResumeSessionListResponse(BaseModel):
    sessions: list[ResumeSessionResponse]


class ResumeMessageSendRequest(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class ResumeMessageResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    role: str
    content: str
    message_order: int
    created_at: str

    model_config = {"from_attributes": True}


class ResumeSessionDetailResponse(BaseModel):
    session: ResumeSessionResponse
    messages: list[ResumeMessageResponse]


class ResumeResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    resume_json: str
    template: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class ResumeTemplateUpdateRequest(BaseModel):
    template: str = Field(pattern=r"^(professional|modern|simple|rendercv|sidebar|jake)$")


class ResumeListResponse(BaseModel):
    resumes: list[ResumeResponse]


# ─── Classroom ──────────────────────────────────────────────

class CourseModuleResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    duration_seconds: int
    category: str
    order_index: int
    segments_json: Optional[str] = None
    created_at: str

    model_config = {"from_attributes": True}


class CourseModuleListResponse(BaseModel):
    modules: list[CourseModuleResponse]


class ModuleQuizResponse(BaseModel):
    id: str
    module_id: str
    trigger_at_seconds: int
    question: str
    options_json: str
    hint: Optional[str] = None
    order_index: int

    model_config = {"from_attributes": True}


class ModuleDetailResponse(BaseModel):
    module: CourseModuleResponse
    quizzes: list[ModuleQuizResponse]


class UserProgressResponse(BaseModel):
    id: str
    user_id: str
    module_id: str
    last_position_seconds: int
    quizzes_passed_json: Optional[str] = None
    is_completed: int
    score: int
    updated_at: str

    model_config = {"from_attributes": True}


class ProgressSyncRequest(BaseModel):
    module_id: str = Field(min_length=1, max_length=36)
    last_position_seconds: int = Field(ge=0)
    quizzes_passed_json: Optional[str] = None
    score: Optional[int] = Field(default=None, ge=0)
    is_completed: Optional[int] = Field(default=None, ge=0, le=1)


class QuizAnswerRequest(BaseModel):
    quiz_id: str = Field(min_length=1, max_length=36)
    selected_index: int = Field(ge=0)


class QuizAnswerResponse(BaseModel):
    correct: bool
    correct_index: int
    hint: Optional[str] = None


# ─── Assessment & Certificate Schemas ────────────────────


class AssessmentResponse(BaseModel):
    id: str
    module_id: str
    title: str
    description: Optional[str] = None
    time_limit_seconds: int
    pass_threshold: int
    total_questions: int
    retry_cooldown_hours: int
    is_published: int
    created_at: str
    # Computed fields added by endpoint
    module_title: Optional[str] = None
    module_category: Optional[str] = None
    user_status: Optional[str] = None  # locked/available/passed/failed/cooldown
    best_score: Optional[int] = None
    last_attempt_at: Optional[str] = None
    cooldown_until: Optional[str] = None

    model_config = {"from_attributes": True}


class AssessmentListResponse(BaseModel):
    assessments: list[AssessmentResponse]


class AssessmentQuestionPublic(BaseModel):
    """Question without correct_index — sent during assessment."""
    id: str
    question: str
    options_json: str
    order_index: int

    model_config = {"from_attributes": True}


class AssessmentStartResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    questions: list[AssessmentQuestionPublic]
    expires_at: str
    time_limit_seconds: int
    saved_answers: Optional[list] = None  # Restored answers for resumed attempt


class AnswerItem(BaseModel):
    question_id: str
    selected_index: int = Field(ge=0, le=3)


class AssessmentAutoSaveRequest(BaseModel):
    attempt_id: str
    answers: list[AnswerItem]


class AssessmentSubmitRequest(BaseModel):
    attempt_id: str
    answers: list[AnswerItem]


class QuestionReview(BaseModel):
    question_id: str
    question: str
    options: list[str]
    selected_index: Optional[int] = None
    correct_index: int
    is_correct: bool
    explanation: Optional[str] = None


class AssessmentResultResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    module_title: str
    score: int
    total: int
    percentage: float
    passed: bool
    time_taken_seconds: int
    submitted_at: str
    questions: list[QuestionReview]
    can_get_certified: bool
    certificate_id: Optional[str] = None


class CertificateGenerateRequest(BaseModel):
    attempt_id: str


class CertificateResponse(BaseModel):
    id: str
    cert_number: str
    cert_slug: str
    module_title: Optional[str] = None
    score: Optional[int] = None
    issued_at: str

    model_config = {"from_attributes": True}


class CertificatePublicResponse(BaseModel):
    cert_data_json: str


class CertificateListResponse(BaseModel):
    certificates: list[CertificateResponse]


class PromoteUserRequest(BaseModel):
    email: str = Field(min_length=1)
