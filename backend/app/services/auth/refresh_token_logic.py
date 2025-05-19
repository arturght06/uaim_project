"""Access token refreshing service"""
import datetime

from flask import jsonify

from app import Config
from app.models import RefreshToken, User
from app.extensions import db
from app.utils.auth.refresh_token import sha512_hash
from app.utils.wrappers import data_required
from app.utils.auth.access_token import create_access_token
from app.utils.auth.refresh_token import create_refresh_token_for_user


@data_required
def process_refreshing_token_logic(data):
    try:
        if "refresh_token" not in data:
            return jsonify({"error": "Missing refresh token"}), 400

        refresh_token = data["refresh_token"]
        hashed_token = sha512_hash(refresh_token)

        token_record = db.session.query(RefreshToken).filter(
            RefreshToken.token == hashed_token,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.datetime.now()
        ).first()

        if not token_record:
            return jsonify({"error": "Invalid or expired refresh token, login one more time!"}), 400

        user = db.session.query(User).filter(User.id == token_record.user_id).first()

        if not user:
            # Revoke the token if user doesn't exist
            token_record.revoked = True
            token_record.revoked_reason = "User not found"
            db.commit()
            return jsonify({'error': "User not found"}), 401

        token_record.revoked = True
        token_record.revoked_reason = "Replaced by new token"

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token_for_user(db, str(user.id))

        db.session.commit()
        response_data = {
            "success": True,
            "user": user.to_dict(),
            "tokens": {
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": Config.ACCESS_TOKEN_AGE * 60,
                "refresh_token": refresh_token,
            }
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': "Unknown server error!", "More:": e}), 400

