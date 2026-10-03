from flask import Blueprint, jsonify, render_template, request

from ..exceptions import ValidationError
from ..models import Category
from ..repositories.participant_repository import (
    get_registered_count,
    get_registered_counts,
)
from ..serializers.event_serializer import serialize_event
from ..serializers.participant_serializer import serialize_participant
from ..service.auth_service import get_current_user_id, login_required
from ..service.event_service import create_event as create_event_service
from ..service.event_service import get_participant_status_service, get_public_events
from ..service.event_service import join_event as join_event_service
from ..service.event_service import leave_event as leave_event_service

events_bp = Blueprint("events", __name__)


@events_bp.route("/")
def render_events_page():
    categories = Category.query.with_entities(Category.id, Category.name, Category.icon).all()

    return render_template(
        "events.html",
        title="MeWe",
        categories=categories
    )


@events_bp.route("/api/events")
def get_events():
    search = request.args.get("search", "").strip()
    category_id = request.args.get("category", type=int)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 15, type=int)

    events, total = get_public_events(search, category_id, page, per_page)
    registered_counts = get_registered_counts([event.id for event in events])
    data = {
        "events": [
            serialize_event(event, registered_counts.get(event.id, 0))
            for event in events
        ],
        "pagination": {
            "total": total,
            "per_page": per_page,
            "current_page": page,
            "last_page": -(-total // per_page)
        }
    }

    return jsonify(data), 200


@events_bp.route("/api/events", methods=["POST"])
@login_required
def create_event():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        raise ValidationError("invalid JSON body")

    event = create_event_service(get_current_user_id(), payload)
    data = serialize_event(event)

    return jsonify(data), 201


@events_bp.route("/api/events/<int:event_id>/participants/me", methods=["GET"])
@login_required
def get_participant_status(event_id: int):
    user_id = get_current_user_id()

    is_creator, is_registered = get_participant_status_service(user_id, event_id)
    registered_count = get_registered_count(event_id)
    data = {
        "is_creator": is_creator,
        "is_registered": is_registered,
        "registered_count": registered_count
    }

    return jsonify(data), 200


@events_bp.route("/api/events/<int:event_id>/participants/me", methods=["PUT"])
@login_required
def join_event(event_id: int):
    user_id = get_current_user_id()
    participant, registered_count, created = join_event_service(user_id, event_id)
    data = {
        "participant": serialize_participant(participant),
        "registered_count": registered_count
    }

    return jsonify(data), 201 if created else 200


@events_bp.route("/api/events/<int:event_id>/participants/me", methods=["DELETE"])
@login_required
def leave_event(event_id: int):
    user_id = get_current_user_id()
    registered_count, deleted = leave_event_service(user_id, event_id)
    data = {
        "registered_count": registered_count
    }

    return jsonify(data), 204 if deleted else 200
