import pytest
from app.utils.auth.password import is_password_valid, hash_new_password, hash_password
import bcrypt

@pytest.mark.parametrize("password,expected", [
    ("Password123!", True),
    ("pass", False),
    ("", False),
    ("PASSWORD123!", False),
    ("password123!", False),
    ("Password!!!", False),
])
def test_is_password_valid(password, expected):
    assert is_password_valid(password) == expected

def test_hash_new_password_and_compare():
    password = "Password123!"
    hash_, salt = hash_new_password(password)
    rehashed = hash_password(password, salt.encode("utf-8"))
    assert hash_ == rehashed
