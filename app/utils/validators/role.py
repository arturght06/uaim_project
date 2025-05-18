from app.models import UserRoleEnum


def is_valid_role(role: str) -> bool:
    """Check whether user's role is valid"""
    try:
        if not role:
            return False
        role = role.upper()
        UserRoleEnum(role)
        return True
    except ValueError:
        return False