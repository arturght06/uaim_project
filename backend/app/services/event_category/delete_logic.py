from flask import jsonify
from app.models.event_category import EventCategory
from sqlalchemy.exc import SQLAlchemyError

def delete_event_category_logic(db, category_id):
    try:
        category = db.session.query(EventCategory).filter_by(id=category_id).first()

        if not category:
            return jsonify({"error": "Category not found"}), 404

        db.session.delete(category)
        db.session.commit()

        return jsonify({"message": "Category deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
