from flask import jsonify
from app.models.notification import Notification, NotificationStatus
from sqlalchemy.exc import SQLAlchemyError
import uuid

def update_notification_logic(db, notification_id, request):
    try:
        notification = db.session.query(Notification).filter_by(id=uuid.UUID(notification_id)).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        data = request.get_json()

        # Update allowed fields
        if "title" in data:
            notification.title = data["title"]
        if "content" in data:
            notification.content = data["content"]
        if "type" in data:
            notification.type = data["type"]
        if "status" in data:
            try:
                notification.status = NotificationStatus[data["status"]]
            except KeyError:
                return jsonify({"error": "Invalid status value"}), 400

        db.session.commit()

        return jsonify({"message": "Notification updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
