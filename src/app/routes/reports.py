from flask import Blueprint, jsonify, request

from src.app.enums.user_role import UserRole
from src.app.service.auth_service import roles_required

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/api/reports")
@roles_required(UserRole.MODERATOR, UserRole.ADMIN)
def get_reports():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 15, type=int)

    reports, total = get_open_reports()

    data = {
        "reports": [
            serialize_report(report)
            for report in reports
        ],
        "pagination": {
            "total": total,
            "per_page": per_page,
            "current_page": page,
            "last_page": -(-total // per_page)
        }
    }

    return jsonify(data), 200
