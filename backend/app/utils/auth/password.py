import bcrypt
import regex


def is_password_valid(password: str) -> bool:
    """Check whether password is valid, rules:
    Length: 1<= and <=30
    Symbols: at least one uppercase and lowercase letter, number and special character
    """
    if not password or len(password) > 100 or len(password) < 8:
        return False
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,100}$"
    return bool(regex.match(pattern, password))


def hash_password(password: str, salt) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def hash_new_password(password: str):
    salt = bcrypt.gensalt()
    password_hash = hash_password(password, salt)
    salt = salt.decode("utf-8")

    return password_hash, salt

