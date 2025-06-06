import pytest
from unittest.mock import MagicMock
from app.services.comment.create_logic import create_comment_logic
from app import create_app


@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield


def test_missing_fields():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {})
    response, status = create_comment_logic(db, request)
    assert status == 400
    assert b"Missing content or event_id" in response.data


def test_successful_comment_creation():
    db = MagicMock()
    request = MagicMock()
    request.get_json.return_value = {
        "content": "Test comment",
        "event_id": "12345678-1234-5678-1234-567812345678"
    }
    request.user_id = "user-id-123"

    response, status = create_comment_logic(db, request)
    assert status == 201
    assert b"Comment created" in response.data
