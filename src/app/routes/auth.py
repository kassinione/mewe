import os
from datetime import datetime

from flask import Blueprint, jsonify, request, abort, session

from ..service.auth import validate_init_data
from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/telegram", methods=["POST"])
def auth_user_data():
    body = request.get_json(silent=True)

    if body is None:
        abort(400, description="invalid JSON body")

    bot_token = os.getenv("BOT_TOKEN")
    user_data = validate_init_data(body.get("initData", ""), bot_token)

    if not user_data:
        abort(401, description="invalid telegram data")

    user = User.query.filter_by(telegram_id=user_data["id"]).first()

    if user is None:
        user = User(
            telegram_id=user_data["id"],
            first_name=user_data.get("first_name", ""),
            last_name=user_data.get("last_name"),
            username=user_data.get("username"),
        )
        db.session.add(user)

    user.last_login_at = datetime.utcnow()
    db.session.commit() 

    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "user": user.to_dict_private()
        }), 200