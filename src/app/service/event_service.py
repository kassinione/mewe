from datetime import datetime, timedelta
from typing import Any

from ..exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError
from ..extensions import db
from ..models import Event, Participant
from ..repositories.event_repository import (
    find_public_events,
    get_event_by_id,
    get_event_for_update,
)
from ..repositories.participant_repository import (
    get_participant,
    get_registered_count,
    is_user_registered,
)
from ..repositories.user_repository import get_user_for_update
from ..schemas.event_schema import validate_create_event_payload


def create_event(user_id: int, payload: dict[str, Any]) -> Event:
    user = get_user_for_update(user_id)

    if user is None:
        raise NotFoundError("user not found")

    now = datetime.utcnow()  # noqa: DTZ003

    if user.last_event_create_at:
        elapsed = now - user.last_event_create_at
        if elapsed < timedelta(minutes=5):
            raise ConflictError("You can create a new event in 5 minutes")


    data = validate_create_event_payload(payload)

    event = Event(
        creator_id=user_id,  # pyright: ignore[reportCallIssue]
        title=data["title"],  # pyright: ignore[reportCallIssue]
        location=data["location"],  # pyright: ignore[reportCallIssue]
        description=data["description"],  # pyright: ignore[reportCallIssue]
        category_id=data["category_id"],  # pyright: ignore[reportCallIssue]
        max_participants=data["max_participants"],  # pyright: ignore[reportCallIssue]
        event_date=data["event_date"],  # pyright: ignore[reportCallIssue]
        duration_minutes=data["duration_minutes"],  # pyright: ignore[reportCallIssue]
    )
    user.last_event_create_at = now

    db.session.add(event)
    db.session.commit()

    return event


def get_public_events(search: str, category_ids: list[int] | None, page: int, per_page: int) -> tuple[list[Event], int]:
    if page < 1:
        raise ValidationError("page must be >= 1")
    if per_page < 1 or per_page > 100:
        raise ValidationError("per_page must be between 1 and 100")

    events, total = find_public_events(search, category_ids, page, per_page)

    return events, total


def get_participant_status_service(user_id: int, event_id: int) -> tuple[bool, bool]:
    event = get_event_by_id(event_id)

    if event is None:
        raise NotFoundError("event not found")

    is_creator = event.creator_id == user_id
    is_registered = is_user_registered(user_id, event_id)

    return is_creator, is_registered


def join_event(user_id: int, event_id: int) -> tuple[Participant, int, bool]:
    event = get_event_for_update(event_id)

    if event is None:
        raise NotFoundError("event not found")

    if event.creator_id == user_id:
        raise ConflictError("creator cannot join their own event")

    event_end = event.event_date
    if event_end <= datetime.utcnow():  # noqa: DTZ003
        raise ConflictError("event has already started")

    participant = get_participant(user_id, event_id)
    if participant:
        return participant, get_registered_count(event_id), False

    if get_registered_count(event_id) >= event.max_participants:
        raise ConflictError("event is full")

    participant = Participant(
        user_id=user_id,  # pyright: ignore[reportCallIssue]
        event_id=event_id  # pyright: ignore[reportCallIssue]
    )
    db.session.add(participant)
    db.session.flush()

    registered_count = get_registered_count(event_id)
    db.session.commit()

    return participant, registered_count, True


def leave_event(user_id: int, event_id: int) -> tuple[int, bool]:
    event = get_event_for_update(event_id)

    if event is None:
        raise NotFoundError("event not found")

    participant = (
        db.session.query(Participant)
        .filter_by(user_id=user_id, event_id=event_id)
        .first()
    )

    if participant is None:
        return get_registered_count(event_id), False

    db.session.delete(participant)
    db.session.flush()

    registered_count = get_registered_count(event_id)
    db.session.commit()

    return registered_count, True


def delete_event(user_id: int, event_id: int) -> None:
    event = get_event_for_update(event_id)

    if event is None:
        raise NotFoundError("event not found")

    if event.creator_id != user_id:
        raise ForbiddenError("only the creator can delete the event")

    if event.event_date <= datetime.utcnow():  # noqa: DTZ003
        raise ConflictError("event has already started or finished")

    db.session.delete(event)
    db.session.commit()
