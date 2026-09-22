from flask import Blueprint, jsonify, render_template, request

from ..exceptions import NotFoundError, ValidationError
from ..repositories.user_repository import get_user_by_id
from ..service.auth_service import get_current_user_id, login_required
from ..service.profile_service import change_about_user

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile")
@login_required
def render_profile_page():
    user = get_user_by_id(get_current_user_id())

    if user is None:
        raise NotFoundError("user not found")

    return render_template(
        "profile.html",
        title="MeWe",
        user=user
    )


@profile_bp.route("/api/profile/about", methods=["POST"])
@login_required
def update_about():
    payload = request.get_json(silent=True)
    user_id = get_current_user_id()

    if not isinstance(payload, dict):
        raise ValidationError("invalid JSON body")

    about = change_about_user(user_id, payload)

    return jsonify(
        success=True,
        about=about
    )
