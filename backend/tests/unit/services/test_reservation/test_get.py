import pytest
from unittest.mock import MagicMock
from app.services.reservation.get_logic import get_reservations_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_get_reservations_success():
    db = MagicMock()
    mock_res = MagicMock(id="1", user_id="u", event_id="e", status="confirmed", reserved_at=MagicMock(isoformat=lambda: "2024-01-01T00:00:00"))
    db.session.query().all.return_value = [mock_res]
    response, status = get_reservations_logic(db)
    assert status == 200
    assert b"confirmed" in response.data

def test_get_reservations_failure():
    db = MagicMock()
    db.session.query().all.side_effect = Exception("fail")
    response, status = get_reservations_logic(db)
    assert status == 500
    assert b"error" in response.data
