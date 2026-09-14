from datetime import date, datetime

from flask import Blueprint, abort, jsonify, render_template, request, session

from ..extensions import db
from ..models import Category, Event
from ..service.auth import login_required

my_events_bp = Blueprint("my_events", __name__)


@my_events_bp.route("/my_events")
@login_required
def render_my_event_page():
    categories = Category.query.with_entities(Category.id, Category.name).all()

    return render_template(
        "my_events.html",
        title="Your own event with MeWe",
        categories=categories,
        today=date.today().isoformat()  # noqa: DTZ011
    )

@my_events_bp.route("/api/my-events")
@login_required
def get_my_events():
    events = (
        Event.query
        .filter(Event.creator_id == session["user_id"])
        .order_by(Event.event_date.asc())
        .all()
    )

    return jsonify({
        "success": True,
        "data": {
            "events": [e.to_dict() for e in events]
        }
    }), 200


@my_events_bp.route("/my_events", methods=["POST"])
@login_required
def create_event():
    body = request.get_json(silent=True)

    if body is None:
        abort(400, description="invalid JSON body")

    title = body.get("title", "").strip()
    location = body.get("location", "").strip()
    description = body.get("description", "").strip()
    category_id = body.get("category")
    try:
        max_participants = int(body.get("max_participants", 1))
    except (ValueError, TypeError):
        abort(400, description="max_participants must be a number")
    event_date_str = body.get("event_date")

    if not title:
        abort(400, description="title is required")
    if not location:
        abort(400, description="location is required")
    if not description:
        abort(400, description="description is required")
    if category_id is None:
        abort(400, description="category is required")
    if max_participants < 2:
        abort(400, description="max_participants must be greater than 1")
    if not event_date_str:
        abort(400, description="event_date is required")
    try:
        event_date = datetime.fromisoformat(event_date_str)
    except ValueError:
        abort(400, description="invalid event_date format")
    if event_date <= datetime.utcnow():  # noqa: DTZ003
        abort(400, description="invalid event_date value")

    new_event = Event(
        title=title,  # pyright: ignore[reportCallIssue]
        location=location,  # pyright: ignore[reportCallIssue]
        description=description,  # pyright: ignore[reportCallIssue]
        category_id=category_id,  # pyright: ignore[reportCallIssue]
        max_participants=max_participants,  # pyright: ignore[reportCallIssue]
        event_date=event_date,  # pyright: ignore[reportCallIssue]
        creator_id=session["user_id"], # pyright: ignore[reportCallIssue]
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        "success": True,
        "data": new_event.to_dict()
    }), 201
