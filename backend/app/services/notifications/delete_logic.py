from flask import jsonify
from app.models.notification import Notification
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging

logger = logging.getLogger(__name__)

def delete_notification_logic(db, notification_id):
    logger.info(f"=== STARTING DELETE NOTIFICATION PROCESS ===")
    logger.info(f"Received notification_id: {notification_id} (type: {type(notification_id)})")
    
    try:
        logger.info(f"Attempting to delete notification with ID: {notification_id}")
        
        # Validate UUID format
        try:
            notification_uuid = uuid.UUID(str(notification_id))
            logger.info(f"Successfully converted to UUID: {notification_uuid}")
        except ValueError as e:
            logger.error(f"UUID conversion failed for notification: {notification_id}, error: {str(e)}")
            return jsonify({"error": "Invalid notification ID format"}), 400

        # Log database session info
        logger.info(f"Database session: {db.session}")
        logger.info(f"Database engine: {db.engine}")

        # Query the notification with more detailed logging
        logger.info(f"Querying notification with UUID: {notification_uuid}")
        notification = db.session.query(Notification).filter_by(id=notification_uuid).first()
        logger.info(f"Query executed successfully. Result: {notification}")
        
        if notification:
            logger.info(f"Found notification: ID={notification.id}, title='{notification.title}', user_id={notification.user_id}, event_id={notification.event_id}")
        else:
            logger.warning(f"No notification found with ID: {notification_uuid}")

        if not notification:
            # Check if any notification exists in database
            logger.info("Checking total notifications in database...")
            total_notifications = db.session.query(Notification).count()
            logger.info(f"Total notifications in database: {total_notifications}")
            
            # List all notifications for debugging
            all_notifications = db.session.query(Notification).all()
            logger.info(f"All notifications in database:")
            for notif in all_notifications:
                logger.info(f"  - ID: {notif.id}, Title: {notif.title}")
            
            return jsonify({"error": "Notification not found"}), 404

        # Log notification details before deletion
        logger.info(f"Found notification to delete: ID={notification.id}, title={notification.title}")

        # Attempt deletion
        logger.info("Attempting to delete notification from database...")
        db.session.delete(notification)
        logger.info("Notification marked for deletion")
        
        logger.info("Committing transaction...")
        db.session.commit()
        logger.info("Transaction committed successfully")
        
        logger.info(f"Successfully deleted notification: {notification_id}")
        return jsonify({
            "message": "Notification deleted successfully",
            "deleted_id": str(notification_id)
        }), 200

    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error occurred: {type(e).__name__}")
        logger.error(f"SQLAlchemy error details: {str(e)}")
        db.session.rollback()
        logger.info("Database session rolled back due to SQLAlchemy error")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error occurred: {type(e).__name__}")
        logger.error(f"Unexpected error details: {str(e)}")
        logger.error(f"Error traceback:", exc_info=True)
        db.session.rollback()
        logger.info("Database session rolled back due to unexpected error")
        return jsonify({"error": "Server error", "details": str(e)}), 500
    finally:
        try:
            logger.info("Closing database session...")
            db.session.close()
            logger.info("Database session closed successfully")
        except Exception as e:
            logger.error(f"Error closing database session: {str(e)}")
        
        logger.info(f"=== DELETE NOTIFICATION PROCESS COMPLETED ===")
