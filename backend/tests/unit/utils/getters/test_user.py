from uuid import uuid4
from unittest.mock import MagicMock
from app.utils.getters.user import get_user_by_id

def test_get_user_by_id_found():
    db = MagicMock()
    fake_user = MagicMock()
    db.session.query().filter_by().first.return_value = fake_user
    result = get_user_by_id(db, str(uuid4()))
    assert result == fake_user

def test_get_user_by_id_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    result = get_user_by_id(db, str(uuid4()))
    assert result is None
