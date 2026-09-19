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
