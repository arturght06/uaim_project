import phonenumbers


def normalize_phone_country_code(code: str) -> str | bool:
    """Check whether phone country code is valid and normalize it"""
    try:
        if not code or len(code) > 3:
            return False
        parsed_number = phonenumbers.parse(f"+{code}1234")
        return str(parsed_number.country_code)
    except phonenumbers.NumberParseException:
        return False


def normalize_phone_number(number: str) -> str | bool:
    """Check whether phone number code is valid"""
    try:
        if not number or len(number) > 15:
            return False
        number = number.replace("+", "").strip()
        if not number.isdigit():
            return False
        parsed_number = phonenumbers.parse(f"+{number}")
        if phonenumbers.is_valid_number(parsed_number):
            return str(parsed_number.national_number)
    except phonenumbers.NumberParseException:
        return False
