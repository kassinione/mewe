from datetime import datetime
from typing import Any, TypedDict

from ..exceptions import ValidationError
from ..field_limits import (
    EVENT_DESCRIPTION_MAX_LENGTH,
    EVENT_LOCATION_MAX_LENGTH,
    EVENT_MAX_DURATION_MINUTES,
    EVENT_MAX_PARTICIPANTS,
    EVENT_MIN_DURATION_MINUTES,
    EVENT_MIN_PARTICIPANTS,
    EVENT_TITLE_MAX_LENGTH,
)


class CreateEventData(TypedDict):
    title: str
    location: str
    description: str
    category_id: int
    max_participants: int
    event_date: datetime
    duration_minutes: int


def validate_create_event_payload(payload: dict[str, Any]) -> CreateEventData:
    title = payload.get("title", "")
    location = payload.get("location", "")
    description = payload.get("description", "")

    if not isinstance(title, str) or not title.strip():
        raise ValidationError("title is required")
    title = title.strip()
    if len(title) > EVENT_TITLE_MAX_LENGTH:
        raise ValidationError(
            f"title must be at most {EVENT_TITLE_MAX_LENGTH} characters"
        )

    if not isinstance(location, str) or not location.strip():
        raise ValidationError("location is required")
    location = location.strip()
    if len(location) > EVENT_LOCATION_MAX_LENGTH:
        raise ValidationError(
            f"location must be at most {EVENT_LOCATION_MAX_LENGTH} characters"
        )

    if not isinstance(description, str) or not description.strip():
        raise ValidationError("description is required")
    description = description.strip()
    if len(description) > EVENT_DESCRIPTION_MAX_LENGTH:
        raise ValidationError(
            f"description must be at most {EVENT_DESCRIPTION_MAX_LENGTH} characters"
        )

    category_id = payload.get("category")

    if not isinstance(category_id, int) or isinstance(category_id, bool):
        raise ValidationError("category is required")

    try:
        max_participants = int(payload.get("max_participants", 1))
    except (ValueError, TypeError):
        raise ValidationError("max_participants must be a number")

    if max_participants < EVENT_MIN_PARTICIPANTS:
        raise ValidationError(
            f"max_participants must be at least {EVENT_MIN_PARTICIPANTS}"
        )
    if max_participants > EVENT_MAX_PARTICIPANTS:
        raise ValidationError(
            f"max_participants must be at most {EVENT_MAX_PARTICIPANTS}"
        )

    event_date_value = payload.get("event_date")

    if not isinstance(event_date_value, str) or not event_date_value:
        raise ValidationError("event_date is required")

    try:
        event_date = datetime.fromisoformat(event_date_value)
    except ValueError as error:
        raise ValidationError("invalid event_date format") from error

    if event_date <= datetime.utcnow():  # noqa: DTZ003
        raise ValidationError("invalid event_date value")

    duration_minutes = payload.get("duration_minutes")
    if (
        not isinstance(duration_minutes, int)
        or isinstance(duration_minutes, bool)
        or duration_minutes < EVENT_MIN_DURATION_MINUTES
        or duration_minutes > EVENT_MAX_DURATION_MINUTES
    ):
        raise ValidationError(
            f"duration_minutes must be between {EVENT_MIN_DURATION_MINUTES} "
            f"and {EVENT_MAX_DURATION_MINUTES}"
        )

    result: CreateEventData = {
        "title": title,
        "location": location,
        "description": description,
        "category_id": category_id,
        "max_participants": max_participants,
        "event_date": event_date,
        "duration_minutes": duration_minutes,
    }

    return result
