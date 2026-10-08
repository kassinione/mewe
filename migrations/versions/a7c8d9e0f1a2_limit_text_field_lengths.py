"""Limit event and profile text field lengths.

Revision ID: a7c8d9e0f1a2
Revises: f5a6b7c8d9e0
Create Date: 2026-10-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7c8d9e0f1a2"
down_revision: Union[str, Sequence[str], None] = "f5a6b7c8d9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


EVENT_TITLE_MAX_LENGTH = 50
EVENT_LOCATION_MAX_LENGTH = 200
EVENT_DESCRIPTION_MAX_LENGTH = 1500
USER_ABOUT_MAX_LENGTH = 1500


def upgrade() -> None:
    bind = op.get_bind()
    length_function = (
        sa.func.char_length
        if bind.dialect.name == "mysql"
        else sa.func.length
    )
    field_limits = (
        ("events", "title", EVENT_TITLE_MAX_LENGTH),
        ("events", "location", EVENT_LOCATION_MAX_LENGTH),
        ("events", "description", EVENT_DESCRIPTION_MAX_LENGTH),
        ("users", "about", USER_ABOUT_MAX_LENGTH),
    )

    for table_name, column_name, max_length in field_limits:
        column = sa.column(column_name)
        table = sa.table(table_name, column)
        oversized_count = bind.execute(
            sa.select(sa.func.count())
            .select_from(table)
            .where(length_function(column) > max_length)
        ).scalar_one()
        if oversized_count:
            raise RuntimeError(
                f"Cannot limit {table_name}.{column_name} to {max_length} "
                f"characters: {oversized_count} existing value(s) exceed the limit"
            )

    with op.batch_alter_table("events") as batch_op:
        batch_op.alter_column(
            "title",
            existing_type=sa.String(length=255),
            type_=sa.String(length=EVENT_TITLE_MAX_LENGTH),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "location",
            existing_type=sa.String(length=255),
            type_=sa.String(length=EVENT_LOCATION_MAX_LENGTH),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "description",
            existing_type=sa.Text(),
            type_=sa.String(length=EVENT_DESCRIPTION_MAX_LENGTH),
            existing_nullable=False,
        )

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "about",
            existing_type=sa.Text(),
            type_=sa.String(length=USER_ABOUT_MAX_LENGTH),
            existing_nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("events") as batch_op:
        batch_op.alter_column(
            "title",
            existing_type=sa.String(length=EVENT_TITLE_MAX_LENGTH),
            type_=sa.String(length=255),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "location",
            existing_type=sa.String(length=EVENT_LOCATION_MAX_LENGTH),
            type_=sa.String(length=255),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "description",
            existing_type=sa.String(length=EVENT_DESCRIPTION_MAX_LENGTH),
            type_=sa.Text(),
            existing_nullable=False,
        )

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "about",
            existing_type=sa.String(length=USER_ABOUT_MAX_LENGTH),
            type_=sa.Text(),
            existing_nullable=True,
        )
