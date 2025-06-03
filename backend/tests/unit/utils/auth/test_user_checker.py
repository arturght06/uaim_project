from unittest.mock import MagicMock
from app.utils.auth.user_checker import check_if_user_exists
from app.models import User

def test_check_if_user_exists():
    user = MagicMock(spec=User)
    user.username = "testuser"
    user.email = "test@example.com"
    user.phone_country_code = "+48"
    user.phone_number = "123456789"

    db = MagicMock()
    db.session.query().filter().first.side_effect = [True, False, False]
    assert check_if_user_exists(db, user) is True
