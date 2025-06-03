import pytest
from unittest.mock import MagicMock
from app.services.notifications.get_user_logic import get_user_notifications_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_get_user_notifications_success():
    db = MagicMock()
    mock_notification = MagicMock(
        id="1", user_id="u", event_id="e", title="t", content="c", type="info", status="sent", created_at=None
    )
    db.session.query().filter_by().order_by().all.return_value = [mock_notification]
    response, status = get_user_notifications_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 200
    assert b"title" in response.data
