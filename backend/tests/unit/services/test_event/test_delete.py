import pytest
from unittest.mock import MagicMock
from app.services.event.delete_logic import delete_event_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_event_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    response, status = delete_event_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 404
    assert b"Event not found" in response.data

def test_delete_success():
    db = MagicMock()
    event = MagicMock()
    db.session.query().filter_by().first.return_value = event
    response, status = delete_event_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 200
    assert b"Event deleted successfully" in response.data

def test_delete_exception():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = MagicMock()
    db.session.delete.side_effect = Exception("fail")
    response, status = delete_event_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 500
    assert b"error" in response.data
