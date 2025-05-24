from flask import jsonify
from app.models.event import Event
from sqlalchemy.exc import SQLAlchemyError

def get_all_events_logic(db):
    try:
        events = db.session.query(Event).all()

        return jsonify([event.to_dict() for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_events_logic(db, user_id):
    try:
        events = db.session.query(Event).filter_by(organizer_id=user_id).all()

        return jsonify([event.to_dict() for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_event_by_id_logic(db, event_id):
    try:
        event = db.session.query(Event).filter_by(id=event_id).first()

        if not event:
            return jsonify({"error": "Event not found"}), 404

        return jsonify(event.to_dict()), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
