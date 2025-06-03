import jwt
from app.utils.auth.token_decoder import decode_token
from app.config import Config

def test_decode_valid_access_token():
    payload = {"user_id": "1", "type": "access"}
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.ALGORITHM)
    result = decode_token(token, "access")
    assert result["user_id"] == "1"
    assert result["type"] == "access"

def test_decode_invalid_type():
    payload = {"user_id": "1", "type": "refresh"}
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.ALGORITHM)
    result = decode_token(token, "access")
    assert "error" in result
