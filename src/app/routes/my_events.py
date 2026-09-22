from datetime import date

from flask import Blueprint, jsonify, render_template, request

from ..exceptions import ValidationError
from ..repositories.category_repository import get_all_categories
from ..repositories.event_repository import get_by_user
from ..serializers.event_serializer import serialize_event
from ..service.auth_service import get_current_user_id, login_required
from ..service.event_service import create_event as create_event_service

my_events_bp = Blueprint("my_events", __name__)


@my_events_bp.route("/my_events")
@login_required
def render_my_event_page():
    categories = get_all_categories()

    return render_template(
        "my_events.html",
        title="MeWe",
        categories=categories,
        today=date.today().isoformat()  # noqa: DTZ011
    )

@my_events_bp.route("/api/my-events")
@login_required
def get_my_events():
    events = get_by_user(get_current_user_id())

    return jsonify({
        "success": True,
        "data": {
            "events": [serialize_event(event) for event in events]
        }
    }), 200


@my_events_bp.route("/api/my-events", methods=["POST"])
@login_required
def create_event():
    user_id = get_current_user_id()
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        raise ValidationError("invalid JSON body")

    event = create_event_service(user_id, payload)

    return jsonify({
        "success": True,
        "data": serialize_event(event)
    }), 201
