from flask import Blueprint, request
from app.extensions import db
from app.services.user.get_logic import get_user_logic, get_user_name_logic, get_all_users_logic
from app.services.user.create_logic import create_user_logic
from app.services.user.update_logic import update_user_logic
from app.services.user.delete_logic import delete_user_logic
from app.utils.wrappers import token_required

user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/', methods=['GET'])
@token_required
def get_all_users():
    return get_all_users_logic(db)

@user_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    return get_user_logic(db, user_id)

@user_bp.route('/name/<user_id>', methods=['GET'])
def get_user_name(user_id):
    return get_user_name_logic(db, user_id)

@user_bp.route('/', methods=['POST'])
def create_user():
    return create_user_logic(db, request)

@user_bp.route('/<user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    return update_user_logic(db, request, user_id)

@user_bp.route('/<user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    return delete_user_logic(db, user_id)
