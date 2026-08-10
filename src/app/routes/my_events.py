from flask import Blueprint, render_template, jsonify, request, abort
from datetime import datetime, date
from ..extensions import db
from ..models import Category, Event


my_events_bp = Blueprint("my_events", __name__)

@my_events_bp.route("/my_events")
def render_my_event_page():
    categories = Category.query.with_entities(Category.id, Category.name).all()

    return render_template(
        "my_events.html", 
        title="Your own event with MeWe",
        categories=categories,
        today=date.today().isoformat()
    )

@my_events_bp.route("/my_events", methods=["POST"])
def create_event():
    data = request.get_json(silent=True)

    if data is None:
        abort(400, description="invalid JSON body")

    title = data.get("title", "").strip()
    location = data.get("location", "").strip()
    description = data.get("description", "").strip()
    category_id = data.get("category")
    try:
        max_participants = int(data.get("max_participants", 1))
    except (ValueError, TypeError):
        abort(400, description="max_participants must be a number")
    event_date_str = data.get("event_date")
    
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
    if event_date <= datetime.utcnow():
        abort(400, description="invalid event_date value")

    new_event = Event( 
        title=title,
        location=location,
        description=description,
        category_id=category_id,
        max_participants=max_participants,
        event_date=event_date
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        "success": True,
        "data": new_event.to_dict()
    }), 201