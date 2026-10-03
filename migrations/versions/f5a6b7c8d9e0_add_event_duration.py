"""Add duration to events.

Revision ID: f5a6b7c8d9e0
Revises: e3f4a5b6c7d8
Create Date: 2026-10-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f5a6b7c8d9e0"
down_revision: Union[str, Sequence[str], None] = "e3f4a5b6c7d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "events",
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
    )
    op.execute(
        sa.text("UPDATE events SET duration_minutes = 60 WHERE duration_minutes IS NULL")
    )
    op.alter_column(
        "events",
        "duration_minutes",
        existing_type=sa.Integer(),
        nullable=False,
        existing_nullable=True,
    )


def downgrade() -> None:
    op.drop_column("events", "duration_minutes")
