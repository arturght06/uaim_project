from email_validator import validate_email, EmailNotValidError


def normalize_email(email: str) -> str | bool:
    """Check whether email is valid and normalize it"""
    if not email or "@" not in email or len(email) >= 256:
        return False

    try:
        valid = validate_email(email.lower(), check_deliverability=False)
        return valid.normalized
    except EmailNotValidError:
        return False
    except Exception:
        return False
