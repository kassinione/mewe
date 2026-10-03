import os

from dotenv import load_dotenv
from flask import Flask, request

from .errors import register_error_handlers
from .exceptions import ForbiddenError
from .extensions import db

load_dotenv()


def create_app():
    app = Flask(__name__)

    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if not bot_token:
        raise RuntimeError("BOT_TOKEN is not configured")

    app_origin = os.getenv("APP_ORIGIN", "").strip()
    if not app_origin:
        raise RuntimeError("APP_ORIGIN is not configured")

    cookie_secret_key = os.getenv("SECRET_KEY", "").strip()
    if not cookie_secret_key:
        raise RuntimeError("SECRET_KEY is not configured")

    app.config["BOT_TOKEN"] = bot_token
    app.config["APP_ORIGIN"] = app_origin
    app.config["SECRET_KEY"] = cookie_secret_key
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_PARTITIONED"] = True

    app.json.ensure_ascii = False  # type: ignore

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/mewe_app"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    register_error_handlers(app)

    @app.before_request
    def check_request_origin():
        if not request.path.startswith("/api/"):
            return

        if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
            return

        origin = request.headers.get("Origin")
        if origin != app.config["APP_ORIGIN"]:
            raise ForbiddenError("untrusted request origin")


    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from .routes.events import events_bp
    app.register_blueprint(events_bp)

    from .routes.my_events import my_events_bp
    app.register_blueprint(my_events_bp)

    from .routes.profile import profile_bp
    app.register_blueprint(profile_bp)

    return app
