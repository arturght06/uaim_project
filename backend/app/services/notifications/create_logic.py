from flask import jsonify
from app.models.notification import Notification, NotificationStatus
from sqlalchemy.exc import IntegrityError
import uuid

def create_notification_logic(db, request):
    try:
        data = request.get_json()

        required_fields = ["user_id", "event_id", "title", "content", "type", "status"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        new_notification = Notification(
            user_id=uuid.UUID(data["user_id"]),
            event_id=uuid.UUID(data["event_id"]),
            title=data["title"],
            content=data["content"],
            type=data["type"],
            status=NotificationStatus[data["status"]]  # string to Enum
        )
        db.session.add(new_notification)
        db.session.commit()

        return jsonify({"message": "Notification created", "id": str(new_notification.id)}), 201

    except KeyError as e:
        return jsonify({"error": f"Invalid enum value: {str(e)}"}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
