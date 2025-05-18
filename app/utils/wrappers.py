import json
from functools import wraps
from flask import request, jsonify
from app.utils.auth.token_decoder import decode_token


def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid authorization header format"}), 401

        token = parts[1]

        payload = decode_token(token, "access")
        if "error" in payload:
            return jsonify({"error": payload["error"]}), 401

        request.user_id = payload["user_id"]
        request.token = payload
        return f(*args, **kwargs)
    return decorated_function


def data_required(f):
    """Wrapper checks whether the data of request given and valid"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_data()
        if not data:
            return jsonify({'error': 'Request body is empty'}), 400

        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON format in request body'}), 400
        return f(data)
    return decorated_function


