from flask import jsonify
from app.models.reservation import Reservation
from app.models.user import User
from app.models.event import Event
from app.utils.mailer import send_confirmation_email
from sqlalchemy.exc import SQLAlchemyError
import uuid

def delete_reservation_logic(db, reservation_id):
    try:
        reservation = db.session.query(Reservation).filter_by(id=uuid.UUID(reservation_id)).first()

        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404

        # Get user and event before deletion
        user = db.session.get(User, reservation.user_id)
        event = db.session.get(Event, reservation.event_id)

        db.session.delete(reservation)
        db.session.commit()

        if user and event:
            send_confirmation_email(user.email, event.name, is_reservation=False)

        return jsonify({"message": "Reservation deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
