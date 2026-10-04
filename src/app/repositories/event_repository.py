from datetime import datetime

from sqlalchemy import exists, or_, select
from sqlalchemy.orm import joinedload

from ..extensions import db
from ..models import Event, Participant


def get_event_by_id(event_id: int) -> Event | None:
    return db.session.get(Event, event_id)


def get_event_for_update(event_id: int) -> Event | None:
    statement = (
        select(Event)
        .where(Event.id == event_id)
        .with_for_update()
    )
    return db.session.scalars(statement).one_or_none()


def get_events_by_user(user_id: int) -> list[Event]:
    events = (
        Event.query
        .options(
            joinedload(Event.creator),  # pyright: ignore[reportArgumentType]
            joinedload(Event.category),  # pyright: ignore[reportArgumentType]
        )
        .filter(Event.creator_id == user_id)
        .order_by(Event.event_date.desc())
        .all()
    )

    return events


def get_events_by_participant(user_id: int) -> list[Event]:
    events = (
        Event.query
        .join(Participant, Participant.event_id == Event.id)
        .options(
            joinedload(Event.creator),  # pyright: ignore[reportArgumentType]
            joinedload(Event.category),  # pyright: ignore[reportArgumentType]
        )
        .filter(Participant.user_id == user_id)
        .order_by(Event.event_date.desc())
        .all()
    )

    return events


def find_public_events(search: str, category_ids: list[int] | None, page: int, per_page: int) -> tuple[list[Event], int]:
    query = Event.query.filter(Event.event_date >= datetime.utcnow())  # noqa: DTZ003

    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%"),
                Event.location.ilike(f"%{search}%")
            )
        )

    if category_ids is not None:
        query = query.filter(Event.category_id.in_(category_ids))

    total = query.count()

    events = (
        query
        .options(
            joinedload(Event.creator),  # pyright: ignore[reportArgumentType]
            joinedload(Event.category),  # pyright: ignore[reportArgumentType]
        )
        .order_by(Event.event_date.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return events, total


def is_user_creator(user_id: int, event_id: int) -> bool:
    statement = select(
        exists().where(
            Event.id == event_id,
            Event.creator_id == user_id,
        )
    )

    return bool(db.session.scalar(statement))
