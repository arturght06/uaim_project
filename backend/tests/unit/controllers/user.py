import pytest
from flask import Flask
from unittest.mock import patch
from app.controllers.user import user_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(user_bp)
    return app

@patch("app.utils.wrappers.decode_token", return_value={"user_id": "123"})
@patch("app.controllers.user.get_all_users_logic")
def test_get_all_users(mock_logic, mock_decode, app):
    mock_logic.return_value = ("OK", 200)
    with app.test_client() as client:
        res = client.get("/users/", headers={"Authorization": "Bearer test.token"})
        assert res.status_code == 200
        mock_logic.assert_called_once()

@patch("app.utils.wrappers.decode_token", return_value={"user_id": "123"})
@patch("app.controllers.user.get_user_logic")
def test_get_user(mock_logic, mock_decode, app):
    mock_logic.return_value = ("User", 200)
    with app.test_client() as client:
        res = client.get("/users/123", headers={"Authorization": "Bearer test.token"})
        assert res.status_code == 200
        mock_logic.assert_called_once()

@patch("app.controllers.user.create_user_logic")
def test_create_user(mock_logic, app):
    mock_logic.return_value = ("Created", 201)
    with app.test_client() as client:
        res = client.post("/users/", json={"username": "test"})
        assert res.status_code == 201
        mock_logic.assert_called_once()
