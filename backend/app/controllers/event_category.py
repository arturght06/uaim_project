from flask import Blueprint, request
from app.extensions import db
from app.services.event_category.get_logic import get_event_category_relations_logic
from app.services.event_category.create_logic import create_event_category_relation_logic
from app.services.event_category.delete_logic import delete_event_category_relation_logic
from app.utils.wrappers import token_required

event_category_bp = Blueprint("event_category", __name__, url_prefix="/api/event-category")

@event_category_bp.route("/", methods=["GET"])
def get_event_categories():
    return get_event_category_relations_logic(db)

@event_category_bp.route("/", methods=["POST"])
@token_required
def create_event_category_relation():
    return create_event_category_relation_logic(db, request)

@event_category_bp.route("/<relation_id>", methods=["DELETE"])
@token_required
def delete_event_category_relation(relation_id):
    return delete_event_category_relation_logic(db, relation_id)
