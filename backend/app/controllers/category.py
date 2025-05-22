from flask import Blueprint, request
from app.extensions import db
from app.services.category.get_logic import get_event_categories_logic
from app.services.category.create_logic import create_event_category_logic
from app.services.category.delete_logic import delete_event_category_logic
from app.utils.wrappers import token_required

category_bp = Blueprint("category", __name__, url_prefix="/api/category")

@category_bp.route("/", methods=["GET"])
def get_categories():
    return get_event_categories_logic(db)

@category_bp.route("/", methods=["POST"])
@token_required
def create_category():
    return create_event_category_logic(db, request)

@category_bp.route("/<category_id>", methods=["DELETE"])
@token_required
def delete_category(category_id):
    return delete_event_category_logic(db, category_id)
