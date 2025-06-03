import pytest
from flask import Flask
from unittest.mock import patch
from app.controllers.reservation import reservation_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.register_blueprint(reservation_bp)
    return app

@patch("app.controllers.reservation.get_reservations_logic")
def test_get_reservations(mock_logic, app):
    mock_logic.return_value = ("List", 200)
    with app.test_client() as client:
        res = client.get("/api/reservations/")
        assert res.status_code == 200

@patch("app.utils.wrappers.decode_token", return_value={"user_id": "1"})
@patch("app.controllers.reservation.create_reservation_logic")
def test_create_reservation(mock_create, mock_decode, app):
    mock_create.return_value = ("OK", 201)
    with app.test_client() as client:
        res = client.post(
            "/api/reservations/",
            json={"event_id": "1"},
            headers={"Authorization": "Bearer test.token"}
        )
        assert res.status_code == 201
        assert b"OK" in res.data
