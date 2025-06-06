import pytest
from unittest.mock import MagicMock
from app.services.notifications.mark_seen_logic import mark_notification_seen_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_mark_notification_seen_success():
    db = MagicMock()
    mock_notification = MagicMock()
    db.session.query().filter_by().first.return_value = mock_notification
    response, status = mark_notification_seen_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 200
    assert b"Notification marked as seen" in response.data
