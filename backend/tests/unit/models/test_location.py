from app.models.location import Location

def test_create_location():
    loc = Location(user_id="123", country="Poland", city="Warsaw", address="Main St")
    assert loc.city == "Warsaw"
    assert loc.country == "Poland"
