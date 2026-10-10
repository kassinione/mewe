from ..models import EventReport


def serialize_report(report : EventReport) -> dict:
    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "event_id": report.event_id,
        "reason": report.reason.value,
        "details": report.details,
        "status": report.status.value,
        "created_at": report.created_at.isoformat() if report.created_at else None
    }
