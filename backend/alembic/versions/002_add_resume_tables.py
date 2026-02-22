"""add resume builder tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-17
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create resume_sessions table
    op.create_table(
        "resume_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False, server_default="New Resume"),
        sa.Column("started_at", sa.String(50), nullable=False),
        sa.Column("ended_at", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("message_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_resume_sessions_user_id", "resume_sessions", ["user_id"])

    # Create resume_messages table
    op.create_table(
        "resume_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "session_id", sa.String(36), sa.ForeignKey("resume_sessions.id"), nullable=False
        ),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_resume_messages_session_id", "resume_messages", ["session_id"])
    op.create_index("ix_resume_messages_user_id", "resume_messages", ["user_id"])

    # Create resumes table
    op.create_table(
        "resumes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "session_id", sa.String(36), sa.ForeignKey("resume_sessions.id"),
            nullable=False, unique=True,
        ),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("resume_json", sa.Text(), nullable=False),
        sa.Column("template", sa.String(30), nullable=False, server_default="professional"),
        sa.Column("created_at", sa.String(50), nullable=False),
        sa.Column("updated_at", sa.String(50), nullable=False),
    )
    op.create_index("ix_resumes_session_id", "resumes", ["session_id"])
    op.create_index("ix_resumes_user_id", "resumes", ["user_id"])


def downgrade() -> None:
    op.drop_table("resumes")
    op.drop_table("resume_messages")
    op.drop_table("resume_sessions")
