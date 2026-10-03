from datetime import date

from flask import Blueprint, jsonify, render_template

from ..repositories.category_repository import get_all_categories
from ..repositories.event_repository import get_events_by_user
from ..repositories.participant_repository import get_registered_counts
from ..schemas.event_schema import MAX_EVENT_PARTICIPANTS
from ..serializers.event_serializer import serialize_event
from ..service.auth_service import get_current_user_id, login_required

my_events_bp = Blueprint("my_events", __name__)


@my_events_bp.route("/my_events")
@login_required
def render_my_event_page():
    categories = get_all_categories()

    return render_template(
        "my_events.html",
        title="MeWe",
        categories=categories,
        max_event_participants=MAX_EVENT_PARTICIPANTS,
        today=date.today().isoformat()  # noqa: DTZ011
    )

@my_events_bp.route("/api/users/me/events")
@login_required
def get_my_events():
    events = get_events_by_user(get_current_user_id())
    registered_counts = get_registered_counts([event.id for event in events])

    return jsonify({
        "events": [
            serialize_event(event, registered_counts.get(event.id, 0))
            for event in events
        ]
    }), 200
