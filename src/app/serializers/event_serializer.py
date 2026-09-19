from ..models import Event


def serialize_event(event: Event) -> dict:
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "location": event.location,
        "creator_id": event.creator_id,
        "creator_name": event.creator.first_name if event.creator else None,
        "category_id": event.category_id,
        "category_name": event.category.name if event.category else None,
        "category_icon": event.category.icon if event.category else None,
        "max_participants": event.max_participants,
        "event_date": event.event_date.isoformat(),
        "formatted_date": event.event_date.strftime("%d.%m.%Y %H:%M"),
    }
