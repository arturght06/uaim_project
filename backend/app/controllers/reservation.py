from flask import Blueprint, request
from app.extensions import db
from app.services.reservation.get_logic import get_reservations_logic
from app.services.reservation.create_logic import create_reservation_logic
from app.services.reservation.delete_logic import delete_reservation_logic
from app.utils.wrappers import token_required
from flask import current_app
import jwt
from app.models.notification import NotificationStatus
from app.models.reservation import Reservation

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


@reservation_bp.route("/confirm/<token>", methods=["GET"])
def confirm_reservation(token):
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = uuid.UUID(payload["user_id"])
        event_id = uuid.UUID(payload["event_id"])

       
        reservation = Reservation.query.filter_by(user_id=user_id, event_id=event_id).first()
        if not reservation:
            return jsonify({"error": "Rezerwacja nie znaleziona"}), 404

        reservation.status = "confirmed"
        db.session.commit()

        
        success_notification = Notification(
            user_id=user_id,
            event_id=event_id,
            title="Rezerwacja potwierdzona",
            content="Twoja rezerwacja zosta?a pomy?lnie potwierdzona.",
            type="confirmation_success",
            status=NotificationStatus.sent
        )
        db.session.add(success_notification)
        db.session.commit()

        return jsonify({"message": "Rezerwacja potwierdzona"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token wygas?"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400