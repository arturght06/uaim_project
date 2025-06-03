import pytest
from unittest.mock import MagicMock
from app.services.notifications.create_logic import create_notification_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_create_notification_success():
    db = MagicMock()
    db.session.commit.return_value = None
    request = MagicMock(get_json=lambda: {
        "user_id": "12345678-1234-5678-1234-567812345678",
        "event_id": "12345678-1234-5678-1234-567812345678",
        "title": "New event",
        "content": "Event details",
        "type": "info",
        "status": "sent"
    })
    response, status = create_notification_logic(db, request)
    assert status == 201
    assert b"Notification created successfully" in response.data
