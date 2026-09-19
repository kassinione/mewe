
from flask import Blueprint, jsonify, render_template, request

from ..models import Category
from ..serializers.event_serializer import serialize_event
from ..service.event_service import get_public_events

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

    data = {
        "events": [serialize_event(event) for event in events],
        "pagination": {
            "total": total,
            "per_page": per_page,
            "current_page": page,
            "last_page": -(-total // per_page)
        }
    }

    return jsonify({
        "success": True,
        "data": data
    }), 200
