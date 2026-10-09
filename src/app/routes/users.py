from flask import Blueprint, jsonify, request

from ..exceptions import ValidationError
from ..repositories.event_repository import (
    get_events_by_participant,
    get_events_by_user,
)
from ..repositories.participant_repository import get_registered_counts
from ..serializers.event_serializer import serialize_event
from ..service.auth_service import get_current_user_id, login_required
from ..service.profile_service import change_about_user

users_bp = Blueprint("users", __name__)


@users_bp.route("/api/users/me/events")
@login_required
def get_my_events():
    events = get_events_by_user(get_current_user_id())
    registered_counts = get_registered_counts([event.id for event in events])
    data = {
        "events": [
            serialize_event(event, registered_counts.get(event.id, 0))
            for event in events
        ]
    }

    return jsonify(data), 200


@users_bp.route("/api/users/me/participations")
@login_required
def get_my_participating_events():
    events = get_events_by_participant(get_current_user_id())
    registered_counts = get_registered_counts([event.id for event in events])
    data = {
        "events": [
            serialize_event(event, registered_counts.get(event.id, 0))
            for event in events
        ]
    }

    return jsonify(data), 200

@users_bp.route("/api/users/me", methods=["PATCH"])
@login_required
def update_about():
    payload = request.get_json(silent=True)
    user_id = get_current_user_id()

    if not isinstance(payload, dict):
        raise ValidationError("invalid JSON body")

    about = change_about_user(user_id, payload)
    data = {
        "about": about
    }

    return jsonify(data), 200
