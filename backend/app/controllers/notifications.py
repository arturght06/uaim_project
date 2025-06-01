from flask import Blueprint, request, jsonify
from app.extensions import db
from app.services.notifications.get_logic import get_notifications_logic
from app.services.notifications.create_logic import create_notification_logic
from app.services.notifications.delete_logic import delete_notification_logic
from app.services.notifications.update_event_logic import update_notification_logic
from app.services.notifications.get_user_logic import get_user_notifications_logic
from app.services.notifications.mark_seen_logic import mark_notification_seen_logic
from app.utils.wrappers import token_required
from app.utils.mailer import send_reminder_email

notification_bp = Blueprint("notification", __name__, url_prefix="/api/notifications")

@notification_bp.route("/", methods=["GET"])
@token_required
def get_notifications():
    return get_notifications_logic(db)

@notification_bp.route("/", methods=["POST"])
@token_required
def create_notification():
    return create_notification_logic(db, request)

@notification_bp.route("/<notification_id>", methods=["PUT"])
@token_required
def update_notification(notification_id):
    return update_notification_logic(db, notification_id, request)

@notification_bp.route("/<notification_id>", methods=["DELETE"])
@token_required
def delete_notification(notification_id):
    return delete_notification_logic(db, notification_id)


@notification_bp.route("/reminder", methods=["POST"])
@token_required
def send_reminder():
    data = request.get_json()
    email = data.get("email")
    event_name = data.get("event_name")
    date = data.get("date")

    if not email or not event_name or not date:
        return jsonify({"error": "email, event_name i date są wymagane"}), 400

    try:
        send_reminder_email(email, event_name, date)
        return jsonify({"message": f"Przypomnienie wysłane na {email}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notification_bp.route("/user/<user_id>", methods=["GET"])
@token_required
def get_user_notifications(user_id):
    return get_user_notifications_logic(db, user_id)

@notification_bp.route("/<notification_id>/seen", methods=["PUT"])
@token_required
def mark_notification_seen(notification_id):
    return mark_notification_seen_logic(db, notification_id)
