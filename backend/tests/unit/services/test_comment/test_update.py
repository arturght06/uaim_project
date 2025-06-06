import pytest
from unittest.mock import MagicMock
from app.services.comment.update_logic import update_comment_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_update_missing_content():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {}, user_id="user1")
    response, status = update_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 400
    assert b"Content is required" in response.data

def test_update_comment_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    request = MagicMock(get_json=lambda: {"content": "New"}, user_id="user1")
    response, status = update_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 404
    assert b"Comment not found" in response.data

def test_update_comment_unauthorized():
    db = MagicMock()
    comment = MagicMock(user_id="other_user")
    db.session.query().filter_by().first.return_value = comment
    request = MagicMock(get_json=lambda: {"content": "New"}, user_id="user1")
    response, status = update_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 403
    assert b"Unauthorized" in response.data

def test_update_comment_success():
    db = MagicMock()
    comment = MagicMock(user_id="user1")
    db.session.query().filter_by().first.return_value = comment
    request = MagicMock(get_json=lambda: {"content": "Updated"}, user_id="user1")
    response, status = update_comment_logic(db, "12345678-1234-5678-1234-567812345678", request)
    assert status == 200
    assert b"Comment updated" in response.data
