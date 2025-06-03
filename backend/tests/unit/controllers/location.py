import pytest
from flask import Flask
from unittest.mock import patch
from app.controllers.location import location_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(location_bp)
    return app

@patch("app.controllers.location.get_all_locations_logic")
def test_get_all_locations(mock_logic, app):
    mock_logic.return_value = ("OK", 200)
    with app.test_client() as client:
        res = client.get("/api/location/")
        assert res.status_code == 200

