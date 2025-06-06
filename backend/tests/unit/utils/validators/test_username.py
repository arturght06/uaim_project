from app.utils.validators.username import is_valid_username

def test_valid_username():
    assert is_valid_username("user_123")

def test_invalid_username_symbols():
    assert not is_valid_username("invalid-username")

def test_invalid_username_too_long():
    assert not is_valid_username("a" * 31)
