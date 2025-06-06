from app.models.event import Event

def test_create_event():
    ev = Event(title="Test Event", description="Sample description")
    assert ev.title == "Test Event"
    assert hasattr(ev, "to_dict")
    result = ev.to_dict()
    assert isinstance(result, dict)
    assert "title" in result
