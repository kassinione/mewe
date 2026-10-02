from ..models import Participant


def serialize_participant(participant: Participant):
    return {
        "id": participant.id,
        "user_id": participant.user_id,
        "event_id": participant.event_id,
        "created_at": participant.created_at.isoformat() if participant.created_at else None
    }
