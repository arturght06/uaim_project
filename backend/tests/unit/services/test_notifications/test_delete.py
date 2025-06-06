import pytest
from unittest.mock import MagicMock
from app.services.notifications.delete_logic import delete_notification_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_delete_notification_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    response, status = delete_notification_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 404
    assert b"Notification not found" in response.data
