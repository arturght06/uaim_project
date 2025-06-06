from app.utils.validators.name_surname import is_valid_name, is_valid_surname

def test_valid_name():
    assert is_valid_name("John")

def test_invalid_name_empty():
    assert not is_valid_name("")

def test_valid_surname():
    assert is_valid_surname("O'Neil")

def test_invalid_surname_long():
    assert not is_valid_surname("A" * 31)
