from flask import jsonify
from app.models.event_category import EventCategory
from sqlalchemy.exc import SQLAlchemyError

def get_event_category_relations_logic(db):
    try:
        relations = db.session.query(EventCategory).all()

        results = [{
            "id": str(rel.id),
            "event_id": str(rel.event_id),
            "category_id": str(rel.category_id)
        } for rel in relations]

        return jsonify(results), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
