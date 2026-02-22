"""add profile_image column to users table

Revision ID: 003
Revises: 002
Create Date: 2026-02-23
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("profile_image", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "profile_image")
