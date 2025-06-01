from flask import jsonify
from app.models.notification import Notification
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging

logger = logging.getLogger(__name__)

def get_user_notifications_logic(db, user_id):
    try:
        logger.info(f"Fetching notifications for user: {user_id}")
        
        # Validate UUID format
        try:
            user_uuid = uuid.UUID(str(user_id))
        except ValueError as e:
            logger.error(f"Invalid user_id format: {user_id}")
            return jsonify({"error": "Invalid user ID format"}), 400
        
        notifications = db.session.query(Notification).filter_by(user_id=user_uuid).order_by(Notification.created_at.desc()).all()
        logger.info(f"Found {len(notifications)} notifications for user {user_id}")
        
        results = []
        for n in notifications:
            try:
                notification_data = {
                    "id": str(n.id),
                    "user_id": str(n.user_id),
                    "event_id": str(n.event_id),
                    "title": n.title,
                    "content": n.content,
                    "type": n.type,
                    "status": n.status.value if hasattr(n.status, 'value') else str(n.status),
                    "created_at": n.created_at.isoformat() if n.created_at else None
                }
                results.append(notification_data)
            except Exception as e:
                logger.error(f"Error processing notification {n.id}: {str(e)}")
                continue
        
        logger.info(f"Successfully processed {len(results)} notifications for user {user_id}")
        return jsonify(results), 200

    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error in get_user_notifications: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        logger.error(f"General error in get_user_notifications: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500
    finally:
        try:
            db.session.close()
        except Exception as e:
            logger.error(f"Error closing database session: {str(e)}")
