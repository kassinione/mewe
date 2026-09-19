from datetime import datetime
from typing import Any, TypedDict

from ..exceptions import ValidationError


class CreateEventData(TypedDict):
    title: str
    location: str
    description: str
    category_id: int
    max_participants: int
    event_date: datetime


def validate_create_event_payload(payload: dict[str, Any]) -> CreateEventData:
    title = payload.get("title", "")
    location = payload.get("location", "")
    description = payload.get("description", "")

    if not isinstance(title, str) or not title.strip():
        raise ValidationError("title is required")

    if not isinstance(location, str) or not location.strip():
        raise ValidationError("location is required")

    if not isinstance(description, str) or not description.strip():
        raise ValidationError("description is required")

    category_id = payload.get("category")

    if not isinstance(category_id, int) or isinstance(category_id, bool):
        raise ValidationError("category is required")

    try:
        max_participants = int(payload.get("max_participants", 1))
    except (ValueError, TypeError):
        raise ValidationError("max_participants must be a number")

    if max_participants < 2:
        raise ValidationError("max_participants must be greater than 1")

    event_date_value = payload.get("event_date")

    if not isinstance(event_date_value, str) or not event_date_value:
        raise ValidationError("event_date is required")

    try:
        event_date = datetime.fromisoformat(event_date_value)
    except ValueError as error:
        raise ValidationError("invalid event_date format") from error

    if event_date <= datetime.utcnow():  # noqa: DTZ003
        raise ValidationError("invalid event_date value")

    result: CreateEventData = {
        "title": title.strip(),
        "location": location.strip(),
        "description": description.strip(),
        "category_id": category_id,
        "max_participants": max_participants,
        "event_date": event_date,
    }

    return result
