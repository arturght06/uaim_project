import pytest
from flask import Flask, jsonify
from app.utils.wrappers import token_required, data_required
from unittest.mock import patch

@pytest.fixture
def app():
    app = Flask(__name__)

    @app.route("/protected", methods=["GET"])
    @token_required
    def protected():
        return jsonify({"message": "OK"}), 200

    @app.route("/with-data", methods=["POST"])
    @data_required
    def with_data(data):
        return jsonify({"received": data}), 200

    return app


@patch("app.utils.wrappers.decode_token", return_value={"user_id": "1"})
def test_token_required_valid_token(mock_decode, app):
    with app.test_client() as client:
        response = client.get("/protected", headers={"Authorization": "Bearer valid.token"})
        assert response.status_code == 200
        assert b"OK" in response.data

def test_data_required_valid_data(app):
    with app.test_client() as client:
        response = client.post("/with-data", json={"key": "value"})
        assert response.status_code == 200
        assert b"key" in response.data
