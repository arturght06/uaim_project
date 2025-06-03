from unittest.mock import patch
from app.utils.factory.user_factory import create_new_user
from app.models import UserRoleEnum

@patch("app.utils.factory.user_factory.validate_user_data")
@patch("app.utils.factory.user_factory.hash_new_password")
def test_create_new_user_success(mock_hash, mock_validate):
    mock_validate.return_value = {
        "username": "test",
        "email": "test@example.com",
        "password": "Password123!",
        "birthday": "2000-01-01"
    }
    mock_hash.return_value = ("hashed", b"salt")
    result = create_new_user({"username": "test"})
    assert hasattr(result, "username")
    assert result.role == UserRoleEnum.user.name

@patch("app.utils.factory.user_factory.validate_user_data")
def test_create_new_user_validation_error(mock_validate):
    mock_validate.return_value = {"errors": {"email": "Invalid"}}
    result = create_new_user({})
    assert "errors" in result
