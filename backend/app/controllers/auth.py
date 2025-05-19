from flask import Blueprint, request

from app.services.auth.register_logic import process_register_logic
from app.utils.wrappers import data_required
from app.services.auth.login_logic import process_login_logic
from app.services.auth.refresh_token_logic import process_refreshing_token_logic

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user by username and password"""
    return process_login_logic(request.get_data())


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user from request's data"""
    return process_register_logic(request)


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    return process_refreshing_token_logic(request)
