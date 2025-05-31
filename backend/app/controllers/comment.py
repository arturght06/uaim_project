from flask import Blueprint, request
from app.extensions import db
from app.services.comment.create_logic import create_comment_logic
from app.services.comment.get_logic import get_comments_logic
from app.services.comment.delete_logic import delete_comment_logic
from app.services.comment.update_logic import update_comment_logic
from app.utils.wrappers import token_required

comment_bp = Blueprint("comment", __name__, url_prefix="/api/comments")

@comment_bp.route("/", methods=["POST"])
@token_required
def create_comment():
    return create_comment_logic(db, request)

@comment_bp.route("/<event_id>", methods=["GET"])
def get_comments(event_id):
    return get_comments_logic(db, event_id)

@comment_bp.route("/<comment_id>", methods=["DELETE"])
@token_required
def delete_comment(comment_id):
    print("DEL")
    return delete_comment_logic(db, comment_id, request)

@comment_bp.route("/<comment_id>", methods=["PUT"])
@token_required
def update_comment(comment_id):
    return update_comment_logic(db, comment_id, request)

