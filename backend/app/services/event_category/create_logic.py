from flask import jsonify
from app.models.event_category import EventCategory
from sqlalchemy.exc import IntegrityError
from uuid import UUID

def create_event_category_relation_logic(db, request):
    try:
        data = request.get_json()

        try:
            event_id = UUID(data.get("event_id"))
            category_id = UUID(data.get("category_id"))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid or missing UUIDs"}), 400

        # Sprawdzenie, czy relacja już istnieje
        existing = db.session.query(EventCategory).filter_by(event_id=event_id, category_id=category_id).first()
        if existing:
            return jsonify({"error": "Relation already exists"}), 409

        relation = EventCategory(event_id=event_id, category_id=category_id)
        db.session.add(relation)
        db.session.commit()

        return jsonify({
            "message": "Relation created",
            "id": str(relation.id)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
