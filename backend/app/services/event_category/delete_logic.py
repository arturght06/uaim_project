from flask import jsonify
from app.models.event_category import EventCategory
from sqlalchemy.exc import SQLAlchemyError

def delete_event_category_relation_logic(db, relation_id):
    try:
        relation = db.session.query(EventCategory).filter_by(id=relation_id).first()

        if not relation:
            return jsonify({"error": "Relation not found"}), 404

        db.session.delete(relation)
        db.session.commit()

        return jsonify({"message": "Relation deleted"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
