import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from app.config import Config


def decode_token(token: str, expected_type: str = "access") -> dict:
    """Verify a JWT access or refresh token"""
    secret_key = Config.SECRET_KEY if expected_type == "access" else Config.REFRESH_SECRET_KEY

    try:
        # Decode the token
        payload = jwt.decode(token, secret_key, algorithms=Config.ALGORITHM)

        # Check type field in payload
        if payload.get("type") != expected_type:
            return {"error": f"Invalid token type: expected '{expected_type}'"}

        return payload

    except ExpiredSignatureError:
        return {"error": "Token has expired"}
    except InvalidTokenError:
        return {"error": "Invalid token"}
