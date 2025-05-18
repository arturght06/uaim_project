"""Location's requests controller"""
from flask import Blueprint, request
from app.extensions import db
from app.services.location import get_location_logic, create_location_logic
from app.utils.wrappers import token_required

location_bp = Blueprint('location', __name__, url_prefix='/api/location')


@location_bp.route('/<uid>', methods=['GET'])
def get_location(uid):
    return get_location_logic(db, uid)


@location_bp.route('/', methods=['POST'])
@token_required
def create_location():
    return create_location_logic(db, request)

