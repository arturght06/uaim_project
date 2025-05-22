from flask import Blueprint, request
from app.extensions import db
from app.services.event.get_logic import get_all_events_logic, get_event_by_id_logic
from app.services.event.create_logic import create_event_logic
from app.services.event.delete_logic import delete_event_logic
from app.utils.wrappers import token_required

event_bp = Blueprint("event", __name__, url_prefix="/api/events")

@event_bp.route("/", methods=["GET"])
def get_all_events():
    return get_all_events_logic(db)

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
