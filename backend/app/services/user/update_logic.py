from flask import jsonify
from app.models.user import User, UserRoleEnum
from sqlalchemy.exc import SQLAlchemyError
import uuid


def update_user_logic(db, request, user_id):
    try:
        user = db.session.query(User).filter_by(id=uuid.UUID(user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()

        # Aktualizujemy tylko dostępne pola (bez zmiany hasła i soli tutaj)
        if "username" in data:
            if db.session.query(User).filter(User.username == data["username"], User.id != user.id).first():
                return jsonify({"error": "Username already in use"}), 409
            user.username = data["username"]

        if "name" in data:
            user.name = data["name"]

        if "surname" in data:
            user.surname = data["surname"]

        if "birthday" in data:
            user.birthday = data["birthday"]

        if "email" in data:
            if db.session.query(User).filter(User.email == data["email"], User.id != user.id).first():
                return jsonify({"error": "Email already in use"}), 409
            user.email = data["email"]

        if "phone_country_code" in data:
            user.phone_country_code = data["phone_country_code"]

        if "phone_number" in data:
            user.phone_number = data["phone_number"]

        if "role" in data:
            try:
                user.role = UserRoleEnum[data["role"]]
            except KeyError:
                return jsonify({"error": "Invalid role"}), 400

        db.session.commit()

        return jsonify({"message": "User updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
