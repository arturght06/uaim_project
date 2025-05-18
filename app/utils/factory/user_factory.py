from datetime import date
from app.models import User, UserRoleEnum
from app.utils.auth.password import hash_new_password
from app.utils.json_validators import validate_user_data


def create_new_user(json_obj, role=UserRoleEnum.user) -> User | dict:
    user_data = dict(validate_user_data(json_obj))

    if "errors" in user_data:
        return user_data

    password_hash, salt = hash_new_password(user_data.pop("password"))
    birthday = date.fromisoformat(user_data.pop("birthday"))

    user = User(**user_data)
    user.role = role.name
    user.salt = salt
    user.password_hash = password_hash
    user.birthday = birthday

    return user



