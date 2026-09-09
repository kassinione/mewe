import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from .extensions import db
from .errors import register_error_handlers


load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

    app.json.ensure_ascii = False  # type: ignore

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/mewe_app"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    register_error_handlers(app)

    CORS(app)

    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from .routes.events import events_bp
    app.register_blueprint(events_bp)

    from .routes.my_events import my_events_bp
    app.register_blueprint(my_events_bp)

    from .routes.profile import profile_bp
    app.register_blueprint(profile_bp)

    return app