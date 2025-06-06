import jwt
import pytest
from unittest.mock import MagicMock
from app.utils.auth.refresh_token import create_refresh_token_for_user, sha512_hash
from app.config import Config

def test_sha512_hash():
    value = "test"
    hashed = sha512_hash(value)
    assert isinstance(hashed, str)
    assert len(hashed) == 128

def test_create_refresh_token_for_user():
    db = MagicMock()
    user_id = "1"
    token = create_refresh_token_for_user(db, user_id)
    decoded = jwt.decode(token, Config.REFRESH_SECRET_KEY, algorithms=[Config.ALGORITHM])
    assert decoded["type"] == "refresh"
    assert decoded["user_id"] == user_id
    assert "exp" in decoded
    assert "jti" in decoded
