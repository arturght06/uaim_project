from unittest.mock import MagicMock, patch
from app.utils.factory.location_factory import create_new_location

def test_create_new_location_success():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    location = create_new_location(db, {"country": "pl", "city": "warsaw", "address": "street 1"}, user_id=1)
    assert location is not None
    db.session.add.assert_called_once()

def test_create_new_location_duplicate():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = True
    location = create_new_location(db, {"country": "pl", "city": "warsaw", "address": "street 1"}, user_id=1)
    assert location is None
