from flask import jsonify
from app.models.reservation import Reservation
from sqlalchemy.exc import SQLAlchemyError

def get_reservations_logic(db):
    try:
        reservations = db.session.query(Reservation).all()
        results = []
        for r in reservations:
            results.append({
                "id": str(r.id),
                "user_id": str(r.user_id),
                "event_id": str(r.event_id),
                "status": r.status,
                "reserved_at": r.reserved_at.isoformat()
            })
        return jsonify(results), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
