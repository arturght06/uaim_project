from app.models.reservation import Reservation

def test_create_reservation():
    res = Reservation(user_id="1", event_id="2")
    assert res.event_id == "2"
    assert res.user_id == "1"
