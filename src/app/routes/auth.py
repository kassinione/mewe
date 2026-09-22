from flask import Blueprint, jsonify, request

from ..exceptions import ValidationError
from ..serializers.user_serializer import serialize_private_user
from ..service.auth_service import auth_or_create_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/telegram", methods=["POST"])
def auth_user_data():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        raise ValidationError("invalid JSON body")

    user = auth_or_create_user(payload)

    return jsonify({
        "success": True,
        "user": serialize_private_user(user)
        }), 200
