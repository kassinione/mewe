"""Make events.max_participants non-nullable.

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-10-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e3f4a5b6c7d8"
down_revision: Union[str, Sequence[str], None] = "d2e3f4a5b6c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text("UPDATE events SET max_participants = 2 WHERE max_participants IS NULL")
    )
    op.alter_column(
        "events",
        "max_participants",
        existing_type=sa.Integer(),
        nullable=False,
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "events",
        "max_participants",
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False,
    )
