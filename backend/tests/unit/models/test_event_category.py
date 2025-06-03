from app.models.event_category import EventCategory

def test_create_event_category():
    ec = EventCategory(event_id="1", category_id="2")
    assert ec.event_id == "1"
    assert ec.category_id == "2"
