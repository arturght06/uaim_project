from flask import jsonify
from app.models.category import Category
from sqlalchemy.exc import SQLAlchemyError

def get_categories_logic(db):
    try:
        categories = db.session.query(Category).all()

        results = []
        for category in categories:
            results.append({
                "id": str(category.id),
                "name": category.name,
                "description": category.description  
            })

        return jsonify(results), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


  