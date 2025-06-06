import pytest
from unittest.mock import MagicMock
from app.services.notifications.get_logic import get_notifications_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_get_notifications_success():
    db = MagicMock()
    mock_notification = MagicMock(
        id="1", user_id="u", event_id="e", title="t", content="c", type="info", status="sent", created_at=None
    )
    db.session.query().all.return_value = [mock_notification]
    response, status = get_notifications_logic(db)
    assert status == 200
    assert b"title" in response.data
