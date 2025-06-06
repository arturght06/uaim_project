import pytest
from flask import Flask
from unittest.mock import patch
from app.controllers.event_category import event_category_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(event_category_bp)
    return app

@patch("app.controllers.event_category.create_event_category_logic")
def test_create_event_category(mock_logic, app):
    mock_logic.return_value = ("Linked", 201)
    with app.test_client() as client:
        payload = {"event_id": "1", "category_id": "2"}
        res = client.post("/api/event-categories/", json=payload)
        assert res.status_code == 201
        assert b"Linked" in res.data
        mock_logic.assert_called_once()
