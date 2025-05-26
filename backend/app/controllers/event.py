from flask import Blueprint, request
from app.extensions import db
from app.services.event.get_logic import get_all_events_logic, get_user_events_logic, get_category_events_logic, get_event_by_id_logic
from app.services.event.create_logic import create_event_logic
from app.services.event.delete_logic import delete_event_logic
from app.utils.wrappers import token_required
from app.services.event.update_logic import update_event_logic

event_bp = Blueprint("event", __name__, url_prefix="/api/events")

@event_bp.route("/", methods=["GET"])
def get_all_events():
    return get_all_events_logic(db)

@event_bp.route("/user/<user_id>", methods=["GET"])
def get_user_events(user_id):
    return get_user_events_logic(db, user_id)

@event_bp.route("/category/<category_id>", methods=["GET"])
def get_category_events(category_id):
    return get_category_events_logic(db, category_id)

@event_bp.route("/<event_id>", methods=["GET"])
def get_event_by_id(event_id):
    return get_event_by_id_logic(db, event_id)

@event_bp.route("/", methods=["POST"])
@token_required
def create_event():
    return create_event_logic(db, request)

@event_bp.route("/<event_id>", methods=["DELETE"])
@token_required
def delete_event(event_id):
    return delete_event_logic(db, event_id)


@event_bp.route("/<event_id>", methods=["PUT"])
@token_required
def update_event(current_user, event_id):
    return update_event_logic(db, event_id, request)
