from flask import Blueprint, request
from app.extensions import db
from app.services.location.get_logic import get_location_logic
from app.services.location.get_logic import get_all_locations_logic
from app.services.location.get_logic import get_user_locations_logic
from app.services.location.create_logic import create_location_logic
from app.services.location.delete_logic import delete_location_logic
from app.utils.wrappers import token_required

location_bp = Blueprint('location', __name__, url_prefix='/api/location')

@location_bp.route('/', methods=['GET'])
def get_all_locations():
    return get_all_locations_logic(db)

@location_bp.route('/user/<user_id>', methods=['GET'])
def get_user_locations(user_id):
    return get_user_locations_logic(db, user_id)

@location_bp.route('/<uid>', methods=['GET'])
def get_location(uid):
    return get_location_logic(db, uid)

@location_bp.route('/', methods=['POST'])
@token_required
def create_location():
    return create_location_logic(db, request)

@location_bp.route('/<uid>', methods=['DELETE'])
@token_required
def delete_location(uid):
    return delete_location_logic(db, uid)
