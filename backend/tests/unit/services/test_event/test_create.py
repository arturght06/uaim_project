import pytest
from unittest.mock import MagicMock
from app.services.event.create_logic import create_event_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_missing_required_field():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {"title": "Title"})  # brak większości pól
    response, status = create_event_logic(db, request)
    assert status == 400
    assert b"Missing required field" in response.data

def test_invalid_uuid_or_date():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {
        "organizer_id": "bad-uuid",
        "location_id": "also-bad",
        "event_date": "not-a-date",
        "title": "Title",
        "description": "Desc"
    })
    response, status = create_event_logic(db, request)
    assert status == 400
    assert b"Invalid UUID or date format" in response.data

def test_invalid_max_participants():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {
        "organizer_id": "12345678-1234-5678-1234-567812345678",
        "location_id": "12345678-1234-5678-1234-567812345678",
        "event_date": "2025-01-01T00:00:00",
        "title": "Title",
        "description": "Desc",
        "max_participants": "a lot"
    })
    response, status = create_event_logic(db, request)
    assert status == 400
    assert b"max_participants must be an integer" in response.data

def test_successful_creation():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {
        "organizer_id": "12345678-1234-5678-1234-567812345678",
        "location_id": "12345678-1234-5678-1234-567812345678",
        "event_date": "2025-01-01T00:00:00",
        "title": "Title",
        "description": "Desc",
        "max_participants": 100
    })
    response, status = create_event_logic(db, request)
    assert status == 201
    assert b"Event created successfully" in response.data

def test_integrity_error():
    db = MagicMock()
    db.session.add.side_effect = Exception("SQL integrity error")
    request = MagicMock(get_json=lambda: {
        "organizer_id": "12345678-1234-5678-1234-567812345678",
        "location_id": "12345678-1234-5678-1234-567812345678",
        "event_date": "2025-01-01T00:00:00",
        "title": "Title",
        "description": "Desc",
        "max_participants": 100
    })
    response, status = create_event_logic(db, request)
    assert status == 500
    assert b"error" in response.data
