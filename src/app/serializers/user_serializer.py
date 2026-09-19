from ..models import User


def serialize_public_user(user: User) -> dict:
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "about": user.about,
    }

def serialize_private_user(user: User) -> dict:
    data = serialize_public_user(user)
    data.update({
        "telegram_id": user.telegram_id,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    })
    return data
