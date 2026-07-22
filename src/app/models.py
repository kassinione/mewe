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
    event_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.relationship("Category", back_populates="events")
    regestations = db.relationship("Registration", back_populates="event", cascade="all, delete-orphan")

# class Registration(db.Model):
#     __tablename__ = "event_registrations"

#     id = db.Column(db.Integer, primary_key=True)
#     event_id = db.Column(db.ForeignKey("events.id"))
#     user_name = db.Column(db.String(255), nullable=False)
#     user_email = db.Column(db.String(255), nullable=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     event = db.relationship("Event", back_populates="regestations")
# ai slope?

# class Users_to_events(db.Model):
#     __tablename__ = "users_to_events"

#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
#     event_id = db.Column(db.Integer, db.ForeignKey("events.id"))
#     created_at = db.Column(db.DateTime, default=datetime.utcnow) 
#     continue after creating the users table 

# class Rating(db.Model):
#     __tablename__ = "ratings"

#     id = db.Column(db.Integer, primary_key=True)
#     event_id = db.Column(db.Integer, db.ForeignKey("events.id"))
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
#     rating = db.Column(db.Integer, nullable=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     continue after creating the users table 
