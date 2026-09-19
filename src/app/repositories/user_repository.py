from ..models import User


def get_user_by_telegram_id(telegram_id: int) -> User | None:
    return User.query.filter_by(telegram_id=telegram_id).first()
