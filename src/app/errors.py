from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from .exceptions import AppError


def register_error_handlers(app: Flask):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        return jsonify({
            "success": False,
            "error": error.message
        }), error.status_code

    @app.errorhandler(HTTPException)
    def handle_other_http_errors(error):
        return jsonify({
            "success": False,
            "error": error.description
        }), error.code

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({
            "success": False,
            "error": "internal server error"
        }), 500
