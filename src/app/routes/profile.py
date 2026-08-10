from flask import Blueprint, render_template


profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/profile")
def render_profile_page():
    return render_template(
        "profile.html",
        title="MeWe profile"
    )