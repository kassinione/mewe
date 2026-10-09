from datetime import date

from flask import Blueprint, render_template

from ..exceptions import NotFoundError
from ..field_limits import (
    EVENT_DESCRIPTION_MAX_LENGTH,
    EVENT_LOCATION_MAX_LENGTH,
    EVENT_TITLE_MAX_LENGTH,
    USER_ABOUT_MAX_LENGTH,
)
from ..models import Category
from ..repositories.category_repository import get_all_categories
from ..repositories.participant_repository import get_participation_count
from ..repositories.user_repository import get_user_by_id
from ..schemas.event_schema import MAX_EVENT_PARTICIPANTS
from ..service.auth_service import get_current_user_id, login_required

index_bp = Blueprint("index", __name__)
my_events_bp = Blueprint("my_events", __name__)
profile_bp = Blueprint("profile", __name__)


@index_bp.route("/")
def render_events_page():
    categories = Category.query.with_entities(Category.id, Category.name, Category.icon).all()

    return render_template(
        "index.html",
        title="MeWe",
        categories=categories
    )


@my_events_bp.route("/my_events")
@login_required
def render_my_event_page():
    categories = get_all_categories()

    return render_template(
        "my_events.html",
        title="MeWe",
        categories=categories,
        max_event_participants=MAX_EVENT_PARTICIPANTS,
        max_event_title_length=EVENT_TITLE_MAX_LENGTH,
        max_event_location_length=EVENT_LOCATION_MAX_LENGTH,
        max_event_description_length=EVENT_DESCRIPTION_MAX_LENGTH,
        today=date.today().isoformat()  # noqa: DTZ011
    )


@profile_bp.route("/profile")
@login_required
def render_profile_page():
    user = get_user_by_id(get_current_user_id())

    if user is None:
        raise NotFoundError("user not found")

    return render_template(
        "profile.html",
        title="MeWe",
        user=user,
        is_own=True,
        participation_count=get_participation_count(user.id),
        profile_about_max_length=USER_ABOUT_MAX_LENGTH,
    )
