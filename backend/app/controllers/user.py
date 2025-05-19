"""User's requests controller"""
from flask import Blueprint, request
from app.extensions import db
from app.services.auth.user_logic import process_get_user_info_logic
from app.utils.wrappers import token_required


user_bp = Blueprint('users', __name__, url_prefix='/users')


@user_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    return process_get_user_info_logic(db, request, user_id)




