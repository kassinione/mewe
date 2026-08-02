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
    category_id = db.Column(db.ForeignKey("categories.id"))
    max_participants = db.Column(db.Integer, default=0)
    event_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.relationship("Category", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_icon": self.category.icon if self.category else None,
            "max_participants": self.max_participants,
            "event_date": self.event_date.isoformat(),
            "formatted_date": self.event_date.strftime("%d.%m.%Y %H:%M")
        }