from flask import jsonify
from app.models.reservation import Reservation
from sqlalchemy.exc import IntegrityError
import uuid

def create_reservation_logic(db, request):
    try:
        data = request.get_json()
        required_fields = ["user_id", "event_id", "status"]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        new_reservation = Reservation(
            user_id=uuid.UUID(data["user_id"]),
            event_id=uuid.UUID(data["event_id"]),
            status=data["status"]
        )

        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({
            "message": "Reservation created successfully",
            "id": str(new_reservation.id)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
