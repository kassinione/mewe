from sqlalchemy import select

from ..extensions import db
from ..models import User


def get_user_by_telegram_id(telegram_id: int) -> User | None:
    return User.query.filter_by(telegram_id=telegram_id).first()


def get_user_by_id(user_id: int) -> User | None:
    return db.session.get(User, user_id)


def get_user_for_update(user_id: int) -> User | None:
    statement = (
        select(User)
        .where(User.id == user_id)
        .with_for_update()
    )
    return db.session.scalars(statement).one_or_none()
