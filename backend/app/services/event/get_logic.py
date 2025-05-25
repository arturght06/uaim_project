from flask import jsonify, request
from app.models.event import Event
from app.models.user import User
from app.models.location import Location
from app.models.reservation import Reservation
from sqlalchemy.exc import SQLAlchemyError

# Add extra data to event object to improve performance
def add_event_data(db, event):
    d = event.to_dict()
    org = db.session.query(User).filter_by(id=event.organizer_id).first()
    d.update({"organizer_data": {"name": org.name, "surname": org.surname}})
    loc = db.session.query(Location).filter_by(id=event.location_id).first()
    d.update({"location_data": loc.to_dict()})
    res_count = db.session.query(Reservation).filter_by(event_id=event.id).count()
    d.update({"reservation_count": res_count})
    uuid = request.headers.get('Useruuid', None)
    if uuid:
        res = db.session.query(Reservation).filter_by(user_id=uuid, event_id=event.id).first()
        if res:
            d.update({"reservation": res.status})
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
        # Events organized by the user
        organized_events = db.session.query(Event).filter_by(organizer_id=user_id).all()

        # Events the user has registered for
        reserved_event_ids = db.session.query(Reservation.event_id).filter_by(user_id=user_id).distinct()
        reserved_events = db.session.query(Event).filter(Event.id.in_(reserved_event_ids)).all()

        # Combine and remove duplicates
        all_events = {event.id: event for event in organized_events + reserved_events}.values()

        return jsonify([add_event_data(db, event) for event in all_events]), 200

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
