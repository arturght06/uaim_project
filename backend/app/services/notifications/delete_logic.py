from flask import jsonify
from app.models.notification import Notification
from sqlalchemy.exc import SQLAlchemyError
import uuid

def delete_notification_logic(db, notification_id):
    try:
        notification = db.session.query(Notification).filter_by(id=uuid.UUID(notification_id)).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        db.session.delete(notification)
        db.session.commit()

        return jsonify({"message": "Notification deleted"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
