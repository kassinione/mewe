from flask import Blueprint, jsonify, request, abort
from datetime import datetime
from sqlalchemy import or_
from ..models import Event


events_bp = Blueprint("events", __name__)

@events_bp.route("/api/events")
def get_events():
    search = request.args.get("search", "").strip()
    category_id = request.args.get("category", type=int)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 15, type=int)

    if page < 1: 
        abort(400, description="page must be >= 1")

    if per_page < 1 or per_page > 100: 
        abort(400, description="per_page must be between 1 and 100")

    query = Event.query.filter(Event.event_date >= datetime.utcnow())

    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%"),
                Event.location.ilike(f"%{search}%")
            )
        )

    if category_id is not None:
        query = query.filter(Event.category_id == category_id)

    total = query.count()

    events = (
        query
        .order_by(Event.event_date.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
        
    return jsonify({
        "success": True,
        "data": {
            "events": [e.to_dict() for e in events],
            "pagination": {
                "total": total,
                "per_page": per_page,
                "current_page": page,
                "last_page": -(-total // per_page)
            }
        }
    })