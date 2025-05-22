from flask import jsonify
from app.models.reservation import Reservation
from sqlalchemy.exc import SQLAlchemyError
import uuid

def delete_reservation_logic(db, reservation_id):
    try:
        reservation = db.session.query(Reservation).filter_by(id=uuid.UUID(reservation_id)).first()

        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404

        db.session.delete(reservation)
        db.session.commit()

        return jsonify({"message": "Reservation deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
