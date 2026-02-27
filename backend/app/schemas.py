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
