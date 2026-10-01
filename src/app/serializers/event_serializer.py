from ..models import Event


def serialize_event(event: Event) -> dict:
    creator_name = None
    creator_username = None

    if event.creator:
        creator_name = " ".join(
            part
            for part in (event.creator.first_name, event.creator.last_name)
            if part
        )
        creator_username = event.creator.username

    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "location": event.location,
        "creator_id": event.creator_id,
        "creator_name": creator_name,
        "creator_username": creator_username,
        "category_id": event.category_id,
        "category_name": event.category.name if event.category else None,
        "category_icon": event.category.icon if event.category else None,
        "max_participants": event.max_participants,
        "event_date": event.event_date.isoformat(),
        "formatted_date": event.event_date.strftime("%d.%m.%Y %H:%M"),
    }
