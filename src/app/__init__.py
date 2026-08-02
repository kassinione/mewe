import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import db
from .errors import register_error_handlers


load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/mewe_app"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    register_error_handlers(app)

    CORS(app)
    
    from .routes.main import main
    app.register_blueprint(main)  

    from .routes.events import events_bp
    app.register_blueprint(events_bp)

    return app