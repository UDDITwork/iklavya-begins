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
    profile_completed: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
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
