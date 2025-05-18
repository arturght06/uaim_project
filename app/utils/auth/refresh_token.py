import hashlib
import jwt
import datetime
import uuid
from app.models import RefreshToken
from app.config import Config


def sha512_hash(value: str) -> str:
    return hashlib.sha512(value.encode('utf-8')).hexdigest()


def create_refresh_token_for_user(db, user_id: str) -> str:
    """Generate new refresh token"""
    # Step 1: Create JWT payload
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=Config.REFRESH_TOKEN_AGE)
    jti = str(uuid.uuid4())
    payload = {
        "type": "refresh",
        "exp": expires_at,
        "user_id": str(user_id),
        "jti": jti,
    }

    # Step 2: encode token
    refresh_token = jwt.encode(payload, Config.REFRESH_SECRET_KEY, algorithm=Config.ALGORITHM)

    # Step 3: hash the token before saving
    hashed_refresh_token = sha512_hash(refresh_token)

    # Step 4: store in DB
    new_token = RefreshToken(
        id=jti,
        user_id=str(user_id),
        token=hashed_refresh_token,
        expires_at=expires_at,
        revoked=False,
    )

    db.session.add(new_token)
    db.session.commit()

    return refresh_token

