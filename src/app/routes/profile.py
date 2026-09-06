from flask import Blueprint, render_template

from ..service.auth import login_required

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile")
@login_required
def render_profile_page():
    return render_template(
        "profile.html",
        title="MeWe profile"
    )