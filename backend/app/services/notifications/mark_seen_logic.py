from flask import jsonify
from app.models.notification import Notification, NotificationStatus
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging

logger = logging.getLogger(__name__)

def mark_notification_seen_logic(db, notification_id):
    try:
        logger.info(f"Marking notification as seen: {notification_id}")
        
        # Validate UUID format
        try:
            notification_uuid = uuid.UUID(str(notification_id))
        except ValueError as e:
            logger.error(f"Invalid notification_id format: {notification_id}")
            return jsonify({"error": "Invalid notification ID format"}), 400
        
        notification = db.session.query(Notification).filter_by(id=notification_uuid).first()
        
        if not notification:
            logger.warning(f"Notification not found: {notification_id}")
            return jsonify({"error": "Notification not found"}), 404
        
        # Log current status before update
        logger.info(f"Current notification status: {notification.status}")
        
        # Update status to seen using the enum value
        notification.status = NotificationStatus.seen
        
        # Log the enum value being set
        logger.info(f"Setting status to: {NotificationStatus.seen} (value: {NotificationStatus.seen.value})")
        
        db.session.commit()
        
        logger.info(f"Successfully marked notification {notification_id} as seen")
        return jsonify({
            "message": "Notification marked as seen",
            "id": str(notification_id),
            "status": notification.status.value
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"SQLAlchemy error in mark_notification_seen: {str(e)}")
        
        # Check if it's an enum-related error
        if "invalid input value for enum" in str(e).lower():
            return jsonify({
                "error": "Database enum error - 'seen' status may not be available in database", 
                "details": "Please run database migration to add 'seen' status to enum"
            }), 500
        
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"General error in mark_notification_seen: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500
    finally:
        try:
            db.session.close()
        except Exception as e:
            logger.error(f"Error closing database session: {str(e)}")
