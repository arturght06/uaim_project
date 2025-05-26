from flask import jsonify
from app.models.reservation import Reservation
from app.models.user import User
from app.models.event import Event
from app.utils.mailer import send_confirmation_email
from sqlalchemy.exc import IntegrityError
import uuid

def create_reservation_logic(db, request):
    try:
        data = request.get_json()
        required_fields = ["user_id", "event_id", "status"]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        user_id = uuid.UUID(data["user_id"])
        event_id = uuid.UUID(data["event_id"])

        # Create reservation
        new_reservation = Reservation(
            user_id=user_id,
            event_id=event_id,
            status=data["status"]
        )

        db.session.add(new_reservation)
        db.session.commit()

        # Get user email and event name
        user = db.session.get(User, user_id)
        event = db.session.get(Event, event_id)

        if user and event:
            send_confirmation_email(user.email, event.name, is_reservation=True)

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
