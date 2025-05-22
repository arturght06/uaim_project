from flask import jsonify
from app.models.user import User
from sqlalchemy.exc import SQLAlchemyError
import uuid


def get_user_logic(db, user_id):
    try:
        user = db.session.query(User).filter_by(id=uuid.UUID(user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict()), 200

    except (ValueError, SQLAlchemyError) as e:
        return jsonify({"error": "Invalid user ID or database error", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_all_users_logic(db):
    try:
        users = db.session.query(User).all()
        results = [user.to_dict() for user in users]
        return jsonify(results), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
