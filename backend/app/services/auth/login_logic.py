"""User login service"""
from flask import jsonify

from app.config import Config
from app.models import User
from app.extensions import db
from app.utils.auth.access_token import create_access_token
from app.utils.auth.password import hash_password
from app.utils.auth.refresh_token import create_refresh_token_for_user
from app.utils.wrappers import data_required


@data_required
def process_login_logic(data):
    """Process, validate login data and returns access-refresh tokens"""
    # Step 1: check if credentials are in data
    if not data or not data.get('login') or not data.get('password'):
        return jsonify("Missing login or password"), 400

    login = str(data["login"])
    password = str(data["password"])

    try:
        # Step 2: try to receive User object by his login
        user = db.session.query(User).filter(
            (User.username == login) | (User.email == login)
        ).one_or_none()

        if not user:
            return jsonify("Invalid credentials"), 401

        # Step 3: check if password's hash is correct
        hashed_password = hash_password(password, user.salt.encode('utf-8'))

        if hashed_password != user.password_hash:
            return jsonify("Invalid credentials"), 401

        # Step 4: create JWT tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token_for_user(db, user.id)

        # Step 5: finally return user's data
        response_data = {
            "success": True,
            "user": user.to_dict(),
            "tokens": {
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": Config.ACCESS_TOKEN_AGE * 60,
                "refresh_token": refresh_token,
            }
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(f"Login failed: {str(e)}"), 500
