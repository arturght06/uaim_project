from uuid import uuid4
from unittest.mock import MagicMock
from app.utils.getters.location import get_location_by_id

def test_get_location_by_id_found():
    db = MagicMock()
    fake_location = MagicMock()
    db.session.query().filter_by().first.return_value = fake_location
    result = get_location_by_id(db, str(uuid4()))
    assert result == fake_location

def test_get_location_by_id_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    result = get_location_by_id(db, str(uuid4()))
    assert result is None
