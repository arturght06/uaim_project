import pytest
from unittest.mock import MagicMock, patch
from app.services.location.create_logic import create_location_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

@patch("app.services.location.create_logic.get_user_by_id")
@patch("app.services.location.create_logic.create_new_location")
def test_create_success(mock_create, mock_user):
    db = MagicMock()
    request = MagicMock(user_id="1", get_data=lambda: b'{"address": "Test St", "city": "Warsaw"}')
    mock_user.return_value = MagicMock(role="admin")
    mock_location = MagicMock(to_dict=lambda: {"id": "1"})
    mock_create.return_value = mock_location
    response, status = create_location_logic(db, request)
    assert status == 200
    assert b"id" in response.data

@patch("app.services.location.create_logic.get_user_by_id")
@patch("app.services.location.create_logic.create_new_location", return_value=None)
def test_create_duplicate(mock_create, mock_user):
    db = MagicMock()
    request = MagicMock(user_id="1", get_data=lambda: b'{"address": "Test"}')
    mock_user.return_value = MagicMock(role="admin")
    response, status = create_location_logic(db, request)
    assert status == 409
    assert b"Location already exists" in response.data
