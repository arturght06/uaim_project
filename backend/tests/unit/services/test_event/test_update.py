import pytest
from unittest.mock import MagicMock
from app.services.event.update_logic import update_event_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_update_missing_content():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {})
    response, status = update_event_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 200


def test_update_event_not_found():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {"title": "New", "description": "New", "event_date": "2025-01-01T00:00:00"})
    db.session.query().filter_by().first.return_value = None
    response, status = update_event_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 404
    assert b"Event not found" in response.data

def test_update_event_success():
    db = MagicMock()
    event = MagicMock()
    request = MagicMock(get_json=lambda: {
        "title": "New",
        "description": "New",
        "event_date": "2025-01-01T00:00:00"
    })
    db.session.query().filter_by().first.return_value = event
    response, status = update_event_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 200
    assert b"Event updated" in response.data

