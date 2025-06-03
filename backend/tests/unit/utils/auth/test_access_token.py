import jwt
from app.utils.auth.access_token import create_access_token
from app.config import Config
import pytest

def test_create_access_token():
    user_id = "12345"
    token = create_access_token(user_id)
    assert isinstance(token, str)

    decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
    assert decoded["type"] == "access"
    assert decoded["user_id"] == user_id
    assert "exp" in decoded
