import regex


def is_valid_username(username: str) -> bool:
    """Check whether username is valid, rules:
    Length: 1<= and <=30
    Symbols: only alphabet characters, numbers and underscore
    """
    reg = regex.match(r"^(?=.{1,30}$)[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$", username)
    if reg:
        reg = reg.string
        return bool(reg)
    return False
