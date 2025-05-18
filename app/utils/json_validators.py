import json
from datetime import date
from app.utils.auth.password import is_password_valid
from app.utils.validators import is_valid_username, is_valid_name, is_valid_surname
from app.utils.validators import normalize_email, normalize_phone_country_code, normalize_phone_number


def validate_user_data(json_obj: str | dict) -> dict:
    if isinstance(json_obj, str):
        try:
            user_data = dict(json.loads(json_obj))
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format"}
    elif isinstance(json_obj, dict):
        user_data = json_obj
    else:
        return {"error": "Invalid input type. Must be dict or string"}

    validated_data = {}
    errors = {}

    username = user_data.get("username")
    if not username or not is_valid_username(username):
        errors["username"] = "Invalid username"
    else:
        validated_data["username"] = username

    name = user_data.get("name")
    if not name or not is_valid_name(name):
        errors["name"] = "Invalid name"
    else:
        validated_data["name"] = name

    surname = user_data.get("surname")
    if not surname or not is_valid_surname(surname):
        errors["surname"] = "Invalid surname"
    else:
        validated_data["surname"] = surname

    birthday = user_data.get("birthday")
    if not birthday:
        errors["birthday"] = "Birthday is required"
    else:
        try:
            date.fromisoformat(birthday)
            validated_data["birthday"] = birthday
        except ValueError:
            errors["birthday"] = "Invalid birthday format (YYYY-MM-DD)"

    email = user_data.get("email")
    normalized_email = normalize_email(email)
    if not normalized_email:
        errors["email"] = "Invalid email"
    else:
        validated_data["email"] = normalized_email

    norm_phone_country_code = ""
    norm_phone_number = ""
    if 'phone_country_code' in user_data:
        phone_country_code: str = user_data.get("phone_country_code")
        norm_phone_country_code = normalize_phone_country_code(phone_country_code)

    if bool(norm_phone_country_code) and "phone_number" in user_data:
        phone_number: str = user_data.get('phone_number')
        norm_phone_number = normalize_phone_number(norm_phone_country_code + phone_number)

    if bool(norm_phone_country_code) and bool(norm_phone_number):
        validated_data["phone_country_code"] = norm_phone_country_code
        validated_data["phone_number"] = norm_phone_number

    password = user_data.get("password")
    if not password or not is_password_valid(password):
        errors["password"] = "Invalid password"
    else:
        validated_data["password"] = password

    if errors:
        return {"errors": errors}

    return validated_data
