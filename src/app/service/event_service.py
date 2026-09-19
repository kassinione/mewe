from typing import Any

from ..exceptions import ValidationError
from ..extensions import db
from ..models import Event
from ..repositories.event_repository import find_public_events
from ..schemas.event_schema import validate_create_event_payload


def create_event(user_id: int, payload: dict[str, Any]) -> Event:
    data = validate_create_event_payload(payload)

    event = Event(
        creator_id=user_id,  # pyright: ignore[reportCallIssue]
        title=data["title"],  # pyright: ignore[reportCallIssue]
        location=data["location"],  # pyright: ignore[reportCallIssue]
        description=data["description"],  # pyright: ignore[reportCallIssue]
        category_id=data["category_id"],  # pyright: ignore[reportCallIssue]
        max_participants=data["max_participants"],  # pyright: ignore[reportCallIssue]
        event_date=data["event_date"],  # pyright: ignore[reportCallIssue]
    )

    db.session.add(event)
    db.session.commit()

    return event

def get_public_events(search: str, category_id: int | None, page: int, per_page: int) -> tuple[list[Event], int]:
    if page < 1:
        raise ValidationError("page must be >= 1")
    if per_page < 1 or per_page > 100:
        raise ValidationError("per_page must be between 1 and 100")

    events, total = find_public_events(search, category_id, page, per_page)

    return events, total
