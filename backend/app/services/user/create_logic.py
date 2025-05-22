from flask import jsonify
from app.models.user import User, UserRoleEnum
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
import uuid


def create_user_logic(db, request):
    try:
        data = request.get_json()

        required_fields = ["username", "name", "surname", "birthday", "email", "phone_country_code",
                           "phone_number", "password", "role"]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Sprawdzenie poprawności roli
        try:
            role = UserRoleEnum[data["role"]]
        except KeyError:
            return jsonify({"error": "Invalid user role"}), 400

        # Sprawdzenie unikalności username i email
        if db.session.query(User).filter_by(username=data["username"]).first():
            return jsonify({"error": "Username already exists"}), 409
        if db.session.query(User).filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 409

        # Generowanie losowej soli
        salt = uuid.uuid4().hex

        # Hashowanie hasła (z wykorzystaniem soli jako prefiksu)
        password_hash = generate_password_hash(salt + data["password"])

        new_user = User(
            username=data["username"],
            name=data["name"],
            surname=data["surname"],
            birthday=data["birthday"],
            email=data["email"],
            phone_country_code=data["phone_country_code"],
            phone_number=data["phone_number"],
            role=role,
            salt=salt,
            password_hash=password_hash
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "id": str(new_user.id)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
