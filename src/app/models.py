from .enums.report_reason import ReportReason
from .enums.report_status import ReportStatus
from .enums.user_role import UserRole
from .extensions import db
from .field_limits import (
    EVENT_DESCRIPTION_MAX_LENGTH,
    EVENT_LOCATION_MAX_LENGTH,
    EVENT_TITLE_MAX_LENGTH,
    REPORT_DETAILS_MAX_LENGTH,
    REPORT_REASON_MAX_LENGTH,
    REPORT_STATUS_MAX_LENGTH,
    USER_ABOUT_MAX_LENGTH,
    USER_ROLE_MAX_LENGTH,
)


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    icon = db.Column(db.String(50))
    events = db.relationship("Event", back_populates="category")


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(EVENT_TITLE_MAX_LENGTH), nullable=False)
    description = db.Column(db.String(EVENT_DESCRIPTION_MAX_LENGTH), nullable=False)
    location = db.Column(db.String(EVENT_LOCATION_MAX_LENGTH), nullable=False)
    creator_id = db.Column(db.ForeignKey("users.id", ondelete="SET NULL"))
    category_id = db.Column(db.ForeignKey("categories.id", ondelete="SET NULL"))
    max_participants = db.Column(db.Integer, default=2, nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    creator = db.relationship("User", back_populates="events")
    category = db.relationship("Category", back_populates="events")


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(
        db.Enum(
            UserRole,
            name="user_role",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda roles: [role.value for role in roles],
            length=USER_ROLE_MAX_LENGTH,
        ),
        nullable=False,
        default=UserRole.USER.value,
        server_default=UserRole.USER.value,
    )
    telegram_id = db.Column(db.BigInteger, unique=True, nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255))
    username = db.Column(db.String(255))
    photo_url = db.Column(db.String(2048))
    about = db.Column(db.String(USER_ABOUT_MAX_LENGTH))
    last_login_at = db.Column(db.DateTime)
    last_event_create_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    events = db.relationship("Event", back_populates="creator")


class Participant(db.Model):
    __tablename__ = "participants"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = db.Column(db.ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    user = db.relationship("User")
    event = db.relationship("Event")

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "event_id",
            name="unique_user_event"
        ),
    )


class EventReport(db.Model):
    __tablename__ = "events_reports"

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = db.Column(db.ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    reason = db.Column(
        db.Enum(
            ReportReason,
            name="report_reason",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda reasons: [reason.value for reason in reasons],
            length=REPORT_REASON_MAX_LENGTH,
        ),
        nullable=False,
        default=ReportReason.OTHER.value,
        server_default=ReportReason.OTHER.value,
    )
    details = db.Column(db.String(REPORT_DETAILS_MAX_LENGTH))
    status = db.Column(
        db.Enum(
            ReportStatus,
            name="report_status",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda statuses: [status.value for status in statuses],
            length=REPORT_STATUS_MAX_LENGTH,
        ),
        nullable=False,
        default=ReportStatus.OPEN.value,
        server_default=ReportStatus.OPEN.value,
    )
    active_event_id = db.Column(
        db.Integer,
        db.Computed(
            f"CASE WHEN status = '{ReportStatus.OPEN.value}' "
            "THEN event_id ELSE NULL END",
            persisted=True,
        ),
        nullable=True,
    )
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    resolved_at = db.Column(db.DateTime)
    resolver_id = db.Column(db.ForeignKey("users.id", ondelete="SET NULL"))
    reporter = db.relationship("User", foreign_keys=[reporter_id])
    resolver = db.relationship("User", foreign_keys=[resolver_id])
    event = db.relationship("Event")

    __table_args__ = (
        db.Index(
            "uq_reports_open_event_per_user",
            "reporter_id",
            "active_event_id",
            unique=True,
        ),
    )
