"""add phone field and new tables

Revision ID: 001
Revises:
Create Date: 2026-02-15
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add phone and profile_completed to users table
    op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))
    op.add_column(
        "users", sa.Column("profile_completed", sa.Integer(), nullable=False, server_default="0")
    )

    # Create user_profiles table
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("date_of_birth", sa.String(20), nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("pin_code", sa.String(10), nullable=True),
        sa.Column("education_level", sa.String(50), nullable=True),
        sa.Column("class_or_year", sa.String(20), nullable=True),
        sa.Column("institution", sa.String(200), nullable=True),
        sa.Column("board", sa.String(50), nullable=True),
        sa.Column("stream", sa.String(100), nullable=True),
        sa.Column("cgpa", sa.String(10), nullable=True),
        sa.Column("parent_occupation", sa.String(100), nullable=True),
        sa.Column("siblings", sa.String(10), nullable=True),
        sa.Column("income_range", sa.String(50), nullable=True),
        sa.Column("hobbies", sa.Text(), nullable=True),
        sa.Column("interests", sa.Text(), nullable=True),
        sa.Column("strengths", sa.Text(), nullable=True),
        sa.Column("weaknesses", sa.Text(), nullable=True),
        sa.Column("languages", sa.Text(), nullable=True),
        sa.Column("career_aspiration_raw", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(50), nullable=False),
        sa.Column("updated_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_user_profiles_user_id", "user_profiles", ["user_id"])

    # Create sessions table
    op.create_table(
        "sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False, server_default="New Session"),
        sa.Column("started_at", sa.String(50), nullable=False),
        sa.Column("ended_at", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("session_summary", sa.Text(), nullable=True),
        sa.Column("questions_asked_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("analysis_generated", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])

    # Create messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("session_id", sa.String(36), sa.ForeignKey("sessions.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_messages_session_id", "messages", ["session_id"])
    op.create_index("ix_messages_user_id", "messages", ["user_id"])

    # Create session_analyses table
    op.create_table(
        "session_analyses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "session_id", sa.String(36), sa.ForeignKey("sessions.id"),
            nullable=False, unique=True,
        ),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("analysis_json", sa.Text(), nullable=True),
        sa.Column("analysis_markdown", sa.Text(), nullable=True),
        sa.Column("roadmap_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_session_analyses_session_id", "session_analyses", ["session_id"])
    op.create_index("ix_session_analyses_user_id", "session_analyses", ["user_id"])

    # Create context_summaries table
    op.create_table(
        "context_summaries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id"),
            nullable=False, unique=True,
        ),
        sa.Column("cumulative_summary", sa.Text(), nullable=True),
        sa.Column("last_updated_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_context_summaries_user_id", "context_summaries", ["user_id"])


def downgrade() -> None:
    op.drop_table("context_summaries")
    op.drop_table("session_analyses")
    op.drop_table("messages")
    op.drop_table("sessions")
    op.drop_table("user_profiles")
    op.drop_column("users", "profile_completed")
    op.drop_column("users", "phone")
