from flask import jsonify
from app.models.user import User
from sqlalchemy.exc import SQLAlchemyError
import uuid


def delete_user_logic(db, user_id):
    try:
        user = db.session.query(User).filter_by(id=uuid.UUID(user_id)).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
