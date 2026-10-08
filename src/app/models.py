from .extensions import db
from .field_limits import (
    EVENT_DESCRIPTION_MAX_LENGTH,
    EVENT_LOCATION_MAX_LENGTH,
    EVENT_TITLE_MAX_LENGTH,
    USER_ABOUT_MAX_LENGTH,
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
