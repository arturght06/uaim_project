from flask import jsonify
from app.models.event import Event
from app.models.user import User
from app.models.location import Location
from sqlalchemy.exc import SQLAlchemyError

# Add the organizer name and location data to event object to improve performance
def add_event_data(db, event):
    d = event.to_dict()
    user = db.session.query(User).filter_by(id=event.organizer_id).first()
    d.update({"organizer_data": {"name": user.name, "surname": user.surname}})
    loc = db.session.query(Location).filter_by(id=event.location_id).first()
    d.update({"location_data": loc.to_dict()})
    return d

def get_all_events_logic(db):
    try:
        events = db.session.query(Event).all()

        return jsonify([add_event_data(db, event) for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_events_logic(db, user_id):
    try:
        events = db.session.query(Event).filter_by(organizer_id=user_id).all()

        return jsonify([add_event_data(db, event) for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_event_by_id_logic(db, event_id):
    try:
        event = db.session.query(Event).filter_by(id=event_id).first()

        if not event:
            return jsonify({"error": "Event not found"}), 404

        return jsonify(add_event_data(db, event)), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
