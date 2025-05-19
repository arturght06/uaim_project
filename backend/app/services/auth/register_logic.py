"""User registration service"""
from flask import jsonify
from app.models.user import User
from app.extensions import db
from app.utils.factory.user_factory import create_new_user
from app.utils.auth.user_checker import check_if_user_exists
from app.utils.wrappers import data_required


@data_required
def process_register_logic(data):
    try:
        new_user = create_new_user(data)

        if isinstance(new_user, dict):
            return jsonify({"errors": new_user["errors"]}), 400
        elif not isinstance(new_user, User):
            print("Unexpected error while registering a new User!")
            return jsonify({'error': 'Failed to create user'}), 500

        if check_if_user_exists(db, new_user):
            return jsonify({"error": "User already exists"}), 400
        db.session.add(new_user)
        try:
            db.session.commit()
            return jsonify({"result": "User successfully registered"}), 200  # Use 201 for successful creation
        except Exception as e:
            db.session.rollback()
            # Consider logging the specific database error for debugging
            return jsonify({'error': 'Failed to save user, try later'}), 500

    except Exception as e:
        return jsonify({'error': "Unknown server error!", "More:": e}), 400
