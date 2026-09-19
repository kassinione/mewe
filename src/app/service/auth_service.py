from datetime import datetime
from functools import wraps
from typing import Any

from flask import current_app, session

from ..exceptions import UnauthorizedError, ValidationError
from ..extensions import db
from ..models import User
from ..repositories.user_repository import get_user_by_telegram_id
from ..schemas.auth_schema import validate_init_data


def get_current_user_id() -> int:
    user_id = session.get("user_id")

    if not isinstance(user_id, int) or isinstance(user_id, bool):
        raise UnauthorizedError("authentication required")

    return user_id


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        get_current_user_id()
        return f(*args, **kwargs)
    return decorated


def auth_or_create_user(payload: dict[str, Any]) -> User:
    bot_token = current_app.config["BOT_TOKEN"]
    init_data = payload.get("initData")
    if not isinstance(init_data, str):
        raise ValidationError("initData is required")

    user_data = validate_init_data(init_data, bot_token)
    user = get_user_by_telegram_id(user_data["id"])

    if user is None:
        user = User(
            telegram_id=user_data["id"],  # pyright: ignore[reportCallIssue]
            first_name=user_data["first_name"],  # pyright: ignore[reportCallIssue]
            last_name=user_data.get("last_name"),  # pyright: ignore[reportCallIssue]
            username=user_data.get("username"),  # pyright: ignore[reportCallIssue]
        )
        db.session.add(user)

    user.last_login_at = datetime.utcnow()  # noqa: DTZ003
    db.session.commit()

    session["user_id"] = user.id

    return user
