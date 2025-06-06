import pytest
from unittest.mock import MagicMock
from app.services.event_category.create_logic import create_event_category_relation_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_create_invalid_uuids():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {"event_id": "bad", "category_id": None})
    response, status = create_event_category_relation_logic(db, request)
    assert status == 400
    assert b"Invalid or missing UUIDs" in response.data

def test_create_existing_relation():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = MagicMock()
    request = MagicMock(get_json=lambda: {
        "event_id": "12345678-1234-5678-1234-567812345678",
        "category_id": "12345678-1234-5678-1234-567812345678"
    })
    response, status = create_event_category_relation_logic(db, request)
    assert status == 409
    assert b"Relation already exists" in response.data

def test_create_success():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    request = MagicMock(get_json=lambda: {
        "event_id": "12345678-1234-5678-1234-567812345678",
        "category_id": "12345678-1234-5678-1234-567812345678"
    })
    response, status = create_event_category_relation_logic(db, request)
    assert status == 201
    assert b"Relation created" in response.data
