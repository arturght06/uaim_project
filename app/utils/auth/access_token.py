import jwt
import datetime
from app.config import Config


def create_access_token(user_id: str) -> str:
    """Generate new Access Token"""
    # Step 1: set expire time
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=Config.ACCESS_TOKEN_AGE)

    # Step 2: create payload
    payload = {
        'type': "access",
        "exp": expires_at,
        "user_id": str(user_id),
    }

    # Step 3: encode and return token
    access_token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.ALGORITHM)
    return access_token
