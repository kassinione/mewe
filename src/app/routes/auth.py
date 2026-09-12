import os
from datetime import datetime

from flask import Blueprint, abort, jsonify, request, session

from ..extensions import db
from ..models import User
from ..service.auth import validate_init_data

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/telegram", methods=["POST"])
def auth_user_data():
    body = request.get_json(silent=True)

    if body is None:
        abort(400, description="invalid JSON body")

    bot_token = os.getenv("BOT_TOKEN")
    user_data = validate_init_data(body.get("initData", ""), bot_token)  # pyright: ignore[reportArgumentType]

    if not user_data:
        abort(401, description="invalid telegram data")

    user = User.query.filter_by(telegram_id=user_data["id"]).first()

    if user is None:
        user = User(
            telegram_id=user_data["id"],  # pyright: ignore[reportCallIssue]
            first_name=user_data.get("first_name", ""),  # pyright: ignore[reportCallIssue]
            last_name=user_data.get("last_name"),  # pyright: ignore[reportCallIssue]
            username=user_data.get("username"),  # pyright: ignore[reportCallIssue]
        )
        db.session.add(user)

    user.last_login_at = datetime.utcnow()  # noqa: DTZ003
    db.session.commit()

    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "user": user.to_dict_private()
        }), 200
