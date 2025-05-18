import regex


def is_valid_name(name: str) -> bool:
    """Check whether name is valid"""
    pattern = r"^\p{L}+(['-]?\p{L}+)*(?:\s\p{L}+(['-]?\p{L}+)*)*$"
    return bool(regex.match(pattern, name)) and 1 <= len(name) <= 30


def is_valid_surname(name: str) -> bool:
    """Check whether surname is valid"""
    pattern = r"^\p{L}+(['-]?\p{L}+)*(?:\s\p{L}+(['-]?\p{L}+)*)*$"
    return bool(regex.match(pattern, name)) and 1 <= len(name) <= 30
