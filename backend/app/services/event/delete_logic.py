from flask import jsonify
from app.models.event import Event
from sqlalchemy.exc import SQLAlchemyError

def delete_event_logic(db, event_id):
    try:
        event = db.session.query(Event).filter_by(id=event_id).first()

        if not event:
            return jsonify({"error": "Event not found"}), 404

        db.session.delete(event)
        db.session.commit()

        return jsonify({"message": "Event deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
