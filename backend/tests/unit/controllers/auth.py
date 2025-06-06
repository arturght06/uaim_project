import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from app.controllers.auth import auth_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    return app

@patch("app.controllers.auth.process_login_logic")
def test_login_route(mock_logic, app):
    mock_logic.return_value = ("OK", 200)
    with app.test_client() as client:
        response = client.post("/auth/login", data=b'{"login": "test"}')
        assert response.status_code == 200
        assert b"OK" in response.data
        mock_logic.assert_called_once()

@patch("app.controllers.auth.process_register_logic")
def test_register_route(mock_logic, app):
    mock_logic.return_value = ("Created", 201)
    with app.test_client() as client:
        response = client.post("/auth/register", json={"username": "user"})
        assert response.status_code == 201
        assert b"Created" in response.data
        mock_logic.assert_called_once()

@patch("app.controllers.auth.process_refreshing_token_logic")
def test_refresh_route(mock_logic, app):
    mock_logic.return_value = ("Refreshed", 200)
    with app.test_client() as client:
        response = client.post("/auth/refresh", json={"refresh_token": "abc"})
        assert response.status_code == 200
        assert b"Refreshed" in response.data
        mock_logic.assert_called_once()
