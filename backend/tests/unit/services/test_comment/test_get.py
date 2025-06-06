import pytest
from unittest.mock import MagicMock
from app.services.comment.get_logic import get_comments_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_get_comments_success():
    from datetime import datetime
    db = MagicMock()
    comment = MagicMock()
    comment.id = "1"
    comment.user_id = "user1"
    comment.event_id = "event-id"
    comment.content = "text"
    comment.created_at = datetime.utcnow()

    user = MagicMock()
    user.name = "Test"
    user.surname = "User"

    db.session.query().filter_by().order_by().all.return_value = [comment]
    db.session.query().filter_by().first.return_value = user

    response, status = get_comments_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 200
    assert b"Test" in response.data


def test_get_comments_empty():
    db = MagicMock()
    db.session.query().filter_by().order_by().all.return_value = []
    response, status = get_comments_logic(db, "12345678-1234-5678-1234-567812345678")
    assert status == 200
    assert b"[]" in response.data
