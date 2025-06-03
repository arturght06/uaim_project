from datetime import date
from app.models.user import User, UserRoleEnum

def test_create_user():
    user = User(
        username="john",
        email="john@example.com",
        role=UserRoleEnum.user,
        birthday=date(2000, 1, 1)
    )
    assert user.username == "john"
    assert user.email == "john@example.com"
    assert user.role == UserRoleEnum.user
    result = user.to_dict()
    assert isinstance(result, dict)
    assert result["role"] == "user"
