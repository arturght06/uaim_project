from typing import Type

from flask import request

from app.models import User


def check_if_user_exists(db, user: Type[User]) -> bool:
    # Check if any user with the same username exists
    try:
        username_exists = db.session.query(User).filter(User.username == user.username).first() is not None

        # Check if any user with the same email exists
        email_exists = db.session.query(User).filter(User.email == user.email).first() is not None

        phone_exists = False
        if user.phone_country_code and user.phone_number:
            phone_exists = db.session.query(User).filter(
                User.phone_country_code == user.phone_country_code,
                User.phone_number == user.phone_number
            ).first() is not None

        return username_exists or email_exists or phone_exists
    except Exception as e:
        raise e


