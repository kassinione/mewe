from typing import Any

from ..exceptions import NotFoundError, ValidationError
from ..extensions import db
from ..field_limits import USER_ABOUT_MAX_LENGTH
from ..repositories.user_repository import get_user_by_id


def change_about_user(user_id: int, payload: dict[str, Any]) -> str:
    about_value = payload.get("about", "")

    if not isinstance(about_value, str):
        raise ValidationError("about must be a string")

    about = about_value.strip()
    user = get_user_by_id(user_id)

    if user is None:
        raise NotFoundError("user not found")

    if len(about) > USER_ABOUT_MAX_LENGTH:
        raise ValidationError(
            f"about must be at most {USER_ABOUT_MAX_LENGTH} characters"
        )

    user.about = about or None

    db.session.commit()

    return about
