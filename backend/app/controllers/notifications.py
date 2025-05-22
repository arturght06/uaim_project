from flask import Blueprint, request
from app.extensions import db
from app.services.notifications.get_logic import get_notifications_logic
from app.services.notifications.create_logic import create_notification_logic
from app.services.notifications.delete_logic import delete_notification_logic
from app.utils.wrappers import token_required

notification_bp = Blueprint("notification", __name__, url_prefix="/api/notifications")

@notification_bp.route("/", methods=["GET"])
def get_notifications():
    return get_notifications_logic(db)

@notification_bp.route("/", methods=["POST"])
@token_required
def create_notification():
    return create_notification_logic(db, request)

@notification_bp.route("/<notification_id>", methods=["DELETE"])
@token_required
def delete_notification(notification_id):
    return delete_notification_logic(db, notification_id)
