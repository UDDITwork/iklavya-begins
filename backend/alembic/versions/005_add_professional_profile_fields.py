"""add professional profile fields to user_profiles table

Revision ID: 005
Revises: 004
Create Date: 2026-03-13
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None

NEW_COLUMNS = [
    ("linkedin_url", sa.String(500)),
    ("portfolio_url", sa.String(500)),
    ("github_url", sa.String(500)),
    ("work_experience", sa.Text),
    ("projects", sa.Text),
    ("certifications", sa.Text),
    ("skills", sa.Text),
    ("achievements", sa.Text),
    ("extracurriculars", sa.Text),
    ("summary", sa.Text),
]


def upgrade() -> None:
    for name, col_type in NEW_COLUMNS:
        op.add_column(
            "user_profiles",
            sa.Column(name, col_type, nullable=True),
        )


def downgrade() -> None:
    for name, _ in reversed(NEW_COLUMNS):
        op.drop_column("user_profiles", name)
