from flask import jsonify
from app.models.notification import Notification
from sqlalchemy.exc import SQLAlchemyError

def get_notifications_logic(db):
    try:
        notifications = db.session.query(Notification).all()
        results = []
        for n in notifications:
            results.append({
                "id": str(n.id),
                "user_id": str(n.user_id),
                "event_id": str(n.event_id),
                "title": n.title,
                "content": n.content,
                "type": n.type,
                "status": n.status.value,
                "created_at": n.created_at.isoformat()
            })
        return jsonify(results), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
