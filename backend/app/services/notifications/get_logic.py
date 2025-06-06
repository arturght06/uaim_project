from flask import jsonify
from app.models.notification import Notification
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def get_notifications_logic(db):
    try:
        logger.info("Starting to fetch notifications from database")
        
        # Use db.session.query instead of db.session.query
        notifications = db.session.query(Notification).all()
        logger.info(f"Query executed successfully. Found {len(notifications)} notifications in database")
        
        if not notifications:
            logger.warning("No notifications found in database")
            return jsonify([]), 200
        
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
                logger.debug(f"Processed notification {n.id}")
            except Exception as e:
                logger.error(f"Error processing notification {n.id}: {str(e)}")
                continue
        
        logger.info(f"Successfully processed {len(results)} notifications")
        return jsonify(results), 200

    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error in get_notifications: {str(e)}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        logger.error(f"General error in get_notifications: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500
    finally:
        # Ensure session is properly closed
        try:
            db.session.close()
        except Exception as e:
            logger.error(f"Error closing database session: {str(e)}")
