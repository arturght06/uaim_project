from flask import jsonify
from app.models.event import Event
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from datetime import datetime

def create_event_logic(db, request):
    try:
        data = request.get_json()

        # Pobranie i walidacja pól
        required_fields = ["organizer_id", "location_id", "event_date", "title", "description"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        try:
            organizer_id = UUID(data["organizer_id"])
            location_id = UUID(data["location_id"])
            event_date = datetime.fromisoformat(data["event_date"])
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid UUID or date format"}), 400

        max_participants = data.get("max_participants")
        if max_participants is not None and not isinstance(max_participants, int):
            return jsonify({"error": "max_participants must be an integer"}), 400

        # Tworzenie nowego wydarzenia
        new_event = Event(
            organizer_id=organizer_id,
            location_id=location_id,
            max_participants=max_participants,
            description=data["description"],
            event_date=event_date,
            title=data["title"]
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            "message": "Event created successfully",
            "id": str(new_event.id)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
