from datetime import datetime

from .extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    icon = db.Column(db.String(50))
    events = db.relationship("Event", back_populates="category")


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    creator_id = db.Column(db.ForeignKey("users.id", ondelete="SET NULL"))
    category_id = db.Column(db.ForeignKey("categories.id", ondelete="SET NULL"))
    max_participants = db.Column(db.Integer, default=2)
    event_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    creator = db.relationship("User", back_populates="events")
    category = db.relationship("Category", back_populates="events")


    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "creator_id": self.creator_id,
            "creator_name": self.creator.first_name if self.creator else None,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_icon": self.category.icon if self.category else None,
            "max_participants": self.max_participants,
            "event_date": self.event_date.isoformat(),
            "formatted_date": self.event_date.strftime("%d.%m.%Y %H:%M"),
        }


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    telegram_id = db.Column(db.BigInteger, unique=True, nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255))
    username = db.Column(db.String(255))
    about = db.Column(db.Text)
    last_login_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    events = db.relationship("Event", back_populates="creator")

    def to_dict(self) -> dict:
        return{
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "username": self.username,
            "about": self.about,
        }

    def to_dict_private(self) -> dict:
        data = self.to_dict()
        data.update({
            "telegram_id": self.telegram_id,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        })
        return data