from flask import Blueprint, request
from app.extensions import db
from app.services.reservation.get_logic import get_reservations_logic
from app.services.reservation.create_logic import create_reservation_logic
from app.services.reservation.delete_logic import delete_reservation_logic
from app.utils.wrappers import token_required

reservation_bp = Blueprint("reservation", __name__, url_prefix="/api/reservations")

@reservation_bp.route("/", methods=["GET"])
def get_reservations():
    return get_reservations_logic(db)

@reservation_bp.route("/", methods=["POST"])
@token_required
def create_reservation():
    return create_reservation_logic(db, request)

@reservation_bp.route("/<reservation_id>", methods=["DELETE"])
@token_required
def delete_reservation(reservation_id):
    return delete_reservation_logic(db, reservation_id)
