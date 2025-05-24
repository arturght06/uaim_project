from flask import jsonify
from app.models import Location
from app.utils.getters import get_location_by_id
from app.utils.errors import handle_server_error, handle_not_found


def get_location_logic(db, uid: str):
    try:
        location: Location = get_location_by_id(db, uid)
        if not location:
            return handle_not_found("Location")
        return jsonify(location.to_dict()), 200
    except Exception:
        return handle_server_error()


def get_all_locations_logic(db):
    try:
        locations = db.session.query(Location).all()
        result = [location.to_dict() for location in locations]
        return jsonify(result), 200
    except Exception:
        return handle_server_error()

def get_user_locations_logic(db, userId):
    try:
        locations = db.session.query(Location).filter_by(user_id=userId).all()
        result = [location.to_dict() for location in locations]
        return jsonify(result), 200
    except Exception:
        return handle_server_error()
