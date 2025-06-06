import pytest
from unittest.mock import MagicMock
from app.services.notifications.update_event_logic import update_notification_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_update_notification_success():
    db = MagicMock()
    mock_notification = MagicMock()
    db.session.query().filter_by().first.return_value = mock_notification
    request = MagicMock(get_json=lambda: {"title": "Updated"})
    response, status = update_notification_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 200
    assert b"Notification updated successfully" in response.data
