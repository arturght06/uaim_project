from flask import Blueprint, request
from app.extensions import db
from app.services.event_category import get_event_categories_logic, create_event_category_logic, delete_event_category_logic
from app.utils.wrappers import token_required

event_category_bp = Blueprint("event_category", __name__, url_prefix="/api/event_category")

@event_category_bp.route("/", methods=["GET"])
def get_categories():
    return get_event_categories_logic(db)

@event_category_bp.route("/", methods=["POST"])
@token_required
def create_category():
    return create_event_category_logic(db, request)

@event_category_bp.route("/<category_id>", methods=["DELETE"])
@token_required
def delete_category(category_id):
    return delete_event_category_logic(db, category_id)
