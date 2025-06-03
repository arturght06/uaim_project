from app.utils.validators.phone import normalize_phone_country_code, normalize_phone_number

def test_valid_country_code():
    assert normalize_phone_country_code("48") == "48"

def test_invalid_country_code():
    assert normalize_phone_country_code("1234") is False

def test_valid_phone_number():
    assert normalize_phone_number("48555123456").isdigit()

def test_invalid_phone_number_non_digit():
    assert normalize_phone_number("abc") is False

def test_invalid_phone_number_long():
    assert normalize_phone_number("1" * 20) is False
