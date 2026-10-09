from sqlalchemy import exists, func, select

from ..extensions import db
from ..models import Participant


def get_registered_count(event_id: int) -> int:
    statement = (
        select(func.count())
        .select_from(Participant)
        .where(Participant.event_id == event_id)
    )

    return db.session.scalar(statement) or 0


def get_participation_count(user_id: int) -> int:
    statement = (
        select(func.count())
        .select_from(Participant)
        .where(Participant.user_id == user_id)
    )

    return db.session.scalar(statement) or 0


def get_registered_counts(event_ids: list[int]) -> dict[int, int]:
    if not event_ids:
        return {}

    statement = (
        select(Participant.event_id, func.count(Participant.id))
        .where(Participant.event_id.in_(event_ids))
        .group_by(Participant.event_id)
    )

    return {
        event_id: count
        for event_id, count in db.session.execute(statement)
    }


def get_participant(user_id: int, event_id: int, ) -> Participant | None:
    statement = (
        select(Participant)
        .where(
            Participant.user_id == user_id,
            Participant.event_id == event_id,
        )
    )

    return db.session.scalars(statement).one_or_none()


def is_user_registered(user_id: int, event_id: int) -> bool:
    statement = select(
        exists().where(
            Participant.user_id == user_id,
            Participant.event_id == event_id,
        )
    )

    return bool(db.session.scalar(statement))
