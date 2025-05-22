from flask import jsonify
from app.models.event_category import EventCategory
from utils.validators.name_surname import is_valid_name
from sqlalchemy.exc import IntegrityError

def create_event_category_logic(db, request):
    try:
        data = request.get_json()

        # Pobranie i walidacja nazwy kategorii
        name = data.get("name")
        if not name or not is_valid_name(name):
            return jsonify({"error": "Invalid or missing category name"}), 400

        # Sprawdzenie unikalności
        if db.session.query(EventCategory).filter_by(name=name).first():
            return jsonify({"error": "Category already exists"}), 409

        # Utworzenie i zapis kategorii
        new_category = EventCategory(name=name)
        db.session.add(new_category)
        db.session.commit()

        return jsonify({
            "message": "Category created successfully",
            "id": new_category.id
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
