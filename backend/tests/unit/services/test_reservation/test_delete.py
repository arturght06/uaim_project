import pytest
from unittest.mock import MagicMock, patch
from app.services.reservation.delete_logic import delete_reservation_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

@patch("app.services.reservation.delete_logic.Reservation")
@patch("app.services.reservation.delete_logic.User")
@patch("app.services.reservation.delete_logic.Event")
@patch("app.services.reservation.delete_logic.send_confirmation_email")
def test_delete_reservation_success(mock_email, mock_event, mock_user, mock_reservation):
    db = MagicMock()
    db.session.query().filter_by().first.return_value = MagicMock(user_id="123", event_id="456")
    db.session.get.side_effect = lambda model, _id: MagicMock(email="mail@example.com", title="Event Title")

    response, status = delete_reservation_logic(db, "33333333-3333-3333-3333-333333333333")
    assert status == 200
    assert b"deleted" in response.data

def test_delete_reservation_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    response, status = delete_reservation_logic(db, "44444444-4444-4444-4444-444444444444")
    assert status == 404
    assert b"not found" in response.data
