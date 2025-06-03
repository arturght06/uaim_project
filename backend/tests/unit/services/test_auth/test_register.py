import pytest
from unittest.mock import patch, MagicMock
from app.services.auth.register_logic import process_register_logic
from app.models import User
from app import create_app

# Fixture uruchamiająca request context — niezbędna dla dekoratora @data_required
@pytest.fixture(autouse=True)
def flask_test_request():
    app = create_app()
    with app.test_request_context(json={}):
        yield

# Test: zwrócenie błędu dla niepoprawnych danych rejestracyjnych
@patch("app.services.auth.register_logic.create_new_user")
def test_invalid_user_data(mock_create):
    mock_create.return_value = {"errors": "Invalid data"}
    response, status = process_register_logic({})
    assert status == 400
    assert b"errors" in response.data

# Test: nieudana rejestracja, bo funkcja nie zwraca użytkownika
@patch("app.services.auth.register_logic.create_new_user")
def test_creation_failure(mock_create):
    mock_create.return_value = "not_a_user"
    response, status = process_register_logic({})
    assert status == 500
    assert b"Failed to create user" in response.data

# Test: użytkownik już istnieje
@patch("app.services.auth.register_logic.db")
@patch("app.services.auth.register_logic.check_if_user_exists", return_value=True)
@patch("app.services.auth.register_logic.create_new_user")
def test_user_already_exists(mock_create, mock_exists, mock_db):
    mock_user = MagicMock(spec=User)
    mock_create.return_value = mock_user
    response, status = process_register_logic({})
    assert status == 400
    assert b"User already exists" in response.data

# Test: poprawna rejestracja
@patch("app.services.auth.register_logic.db")
@patch("app.services.auth.register_logic.check_if_user_exists", return_value=False)
@patch("app.services.auth.register_logic.create_new_user")
def test_successful_registration(mock_create, mock_exists, mock_db):
    mock_user = MagicMock(spec=User)
    mock_create.return_value = mock_user
    response, status = process_register_logic({})
    assert status == 200
    assert b"User successfully registered" in response.data

# Test: wyjątek podczas rejestracji
@patch("app.services.auth.register_logic.create_new_user", side_effect=Exception("Unexpected"))
def test_exception_handling(mock_create):
    response, status = process_register_logic({})
    assert status == 400
    assert b"Unknown server error!" in response.data
