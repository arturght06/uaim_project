from flask import jsonify
from app.models.notification import Notification, NotificationStatus
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import uuid
import logging

logger = logging.getLogger(__name__)

def create_notification_logic(db, request):
    try:
        data = request.get_json()
        logger.info(f"Creating notification with data: {data}")

        required_fields = ["user_id", "event_id", "title", "content", "type", "status"]
        for field in required_fields:
            if field not in data or data[field] is None or str(data[field]).strip() == "":
                logger.error(f"Missing or empty required field: {field}")
                return jsonify({"error": f"Missing or empty field: {field}"}), 400

        try:
            user_id = uuid.UUID(str(data["user_id"]))
            event_id = uuid.UUID(str(data["event_id"]))
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid UUID format: {str(e)}")
            return jsonify({"error": "Invalid UUID format"}), 400

        try:
            status = NotificationStatus[data["status"]]
        except KeyError:
            valid_statuses = [status.value for status in NotificationStatus]
            logger.error(f"Invalid status value: {data['status']}, valid values: {valid_statuses}")
            return jsonify({"error": f"Invalid status value: {data['status']}", "valid_values": valid_statuses}), 400

        new_notification = Notification(
            user_id=user_id,
            event_id=event_id,
            title=str(data["title"]).strip(),
            content=str(data["content"]).strip(),
            type=str(data["type"]).strip(),
            status=status
        )
        
        db.session.add(new_notification)
        db.session.commit()
        
        logger.info(f"Successfully created notification with ID: {new_notification.id}")
        
        return jsonify({
            "message": "Notification created successfully", 
            "id": str(new_notification.id),
            "notification": {
                "id": str(new_notification.id),
                "user_id": str(new_notification.user_id),
                "event_id": str(new_notification.event_id),
                "title": new_notification.title,
                "content": new_notification.content,
                "type": new_notification.type,
                "status": new_notification.status.value,
                "created_at": new_notification.created_at.isoformat() if new_notification.created_at else None
            }
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Database integrity error: {str(e)}")
        return jsonify({"error": "Database integrity error", "details": str(e)}), 500
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"SQLAlchemy error: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"General error in create_notification: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500
