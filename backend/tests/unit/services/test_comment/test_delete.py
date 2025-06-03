import pytest
from unittest.mock import MagicMock
from app.services.comment.delete_logic import delete_comment_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_delete_comment_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    request = MagicMock(user_id="user1")
    response, status = delete_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 404
    assert b"Comment not found" in response.data

def test_delete_comment_unauthorized():
    db = MagicMock()
    comment = MagicMock(user_id="other_user")
    db.session.query().filter_by().first.return_value = comment
    request = MagicMock(user_id="user1")
    response, status = delete_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 403
    assert b"Unauthorized" in response.data

def test_delete_comment_success():
    db = MagicMock()
    comment = MagicMock(user_id="user1")
    db.session.query().filter_by().first.return_value = comment
    request = MagicMock(user_id="user1")
    response, status = delete_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 200
    assert b"Comment deleted" in response.data
