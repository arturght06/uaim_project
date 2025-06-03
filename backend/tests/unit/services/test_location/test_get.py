import pytest
from unittest.mock import MagicMock, patch
from app.services.location.get_logic import get_location_logic, get_all_locations_logic, get_user_locations_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

@patch("app.services.location.get_logic.get_location_by_id")
def test_get_location_success(mock_get):
    db = MagicMock()
    mock_get.return_value = MagicMock(to_dict=lambda: {"id": "1"})
    response, status = get_location_logic(db, "1")
    assert status == 200
    assert b"id" in response.data

@patch("app.services.location.get_logic.get_location_by_id", return_value=None)
def test_get_location_not_found(mock_get):
    db = MagicMock()
    response = get_location_logic(db, "999")
    assert response.status_code == 404
    assert b"not found" in response.data


def test_get_all_locations():
    db = MagicMock()
    mock_location = MagicMock(to_dict=lambda: {"id": "1"})
    db.session.query().all.return_value = [mock_location]
    response, status = get_all_locations_logic(db)
    assert status == 200
    assert b"id" in response.data

def test_get_user_locations():
    db = MagicMock()
    mock_location = MagicMock(to_dict=lambda: {"id": "2"})
    db.session.query().filter_by().all.return_value = [mock_location]
    response, status = get_user_locations_logic(db, "user1")
    assert status == 200
    assert b"id" in response.data
