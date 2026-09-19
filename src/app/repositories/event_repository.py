from datetime import datetime

from sqlalchemy import or_

from ..models import Event


def get_by_user(user_id: int) -> list[Event]:
    events = (
        Event.query
        .filter(Event.creator_id == user_id)
        .order_by(Event.event_date.desc())
        .all()
    )

    return events

def find_public_events(search: str, category_id: int | None, page: int, per_page: int) -> tuple[list[Event], int]:
    query = Event.query.filter(Event.event_date >= datetime.utcnow())  # noqa: DTZ003

    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%"),
                Event.location.ilike(f"%{search}%")
            )
        )

    if category_id is not None:
        query = query.filter(Event.category_id == category_id)

    total = query.count()

    events = (
        query
        .order_by(Event.event_date.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return events, total
