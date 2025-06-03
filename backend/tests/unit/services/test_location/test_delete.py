import pytest
from unittest.mock import MagicMock, patch
from app.services.location.delete_logic import delete_location_logic
from app import create_app
from unittest.mock import patch

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield


@patch("app.services.location.delete_logic.get_location_by_id")
def test_delete_not_found(mock_get):
    db = MagicMock()
    request = MagicMock(user_id="1")
    mock_get.return_value = None
    response = delete_location_logic(db, "999", request)
    assert response.status_code == 404


@patch("app.services.location.delete_logic.get_location_by_id")
def test_delete_unauthorized(mock_get):
    db = MagicMock()
    request = MagicMock(user_id="wrong")
    location = MagicMock(user_id="1")
    mock_get.return_value = location
    response, status = delete_location_logic(db, "1", request)
    assert status == 401
    assert b"Not authorized" in response.data

@patch("app.services.location.delete_logic.get_location_by_id")
def test_delete_success(mock_get):
    db = MagicMock()
    request = MagicMock(user_id="1")
    location = MagicMock(user_id="1")
    mock_get.return_value = location
    response, status = delete_location_logic(db, "1", request)
    assert status == 200
    assert b"Location deleted" in response.data
