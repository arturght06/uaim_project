import pytest
from unittest.mock import patch, MagicMock
from app.services.auth.login_logic import process_login_logic
from app.models import User
from app import create_app

# Fixture: kontekst Flask z danymi logowania
@pytest.fixture(autouse=True)
def flask_test_request():
    app = create_app()
    with app.test_request_context(json={"login": "testuser", "password": "123"}):
        yield

# Test: brak loginu lub hasła
def test_missing_data():
    response, status = process_login_logic({})
    assert status == 401
    assert b"Invalid credentials" in response.data


# Test: użytkownik nie istnieje
@patch("app.services.auth.login_logic.db")
def test_user_not_found(mock_db):
    mock_db.session.query().filter().one_or_none.return_value = None
    response, status = process_login_logic({"login": "wrong", "password": "123"})
    assert status == 401
    assert b"Invalid credentials" in response.data

# Test: błędne hasło
@patch("app.services.auth.login_logic.hash_password", return_value="wrong_hash")
@patch("app.services.auth.login_logic.db")
def test_wrong_password(mock_db, mock_hash):
    user = MagicMock(spec=User, id=1, password_hash="correct_hash", salt="salt", to_dict=lambda: {})
    mock_db.session.query().filter().one_or_none.return_value = user
    response, status = process_login_logic({"login": "testuser", "password": "wrong"})
    assert status == 401
    assert b"Invalid credentials" in response.data

# Test: poprawne logowanie
@patch("app.services.auth.login_logic.create_refresh_token_for_user", return_value="refresh_token")
@patch("app.services.auth.login_logic.create_access_token", return_value="access_token")
@patch("app.services.auth.login_logic.hash_password", return_value="correct_hash")
@patch("app.services.auth.login_logic.db")
def test_successful_login(mock_db, mock_hash, mock_access, mock_refresh):
    user = MagicMock(spec=User, id=1, password_hash="correct_hash", salt="salt", to_dict=lambda: {"id": 1})
    mock_db.session.query().filter().one_or_none.return_value = user
    data = {"login": "testuser", "password": "123"}
    response, status = process_login_logic(data)
    assert status == 200
    assert b"access_token" in response.data
    assert b"refresh_token" in response.data

# Test: wyjątek w logice
@patch("app.services.auth.login_logic.db")
@patch("app.services.auth.login_logic.hash_password", side_effect=Exception("Unexpected"))
def test_exception(mock_hash, mock_db):
    user = MagicMock(spec=User, id=1, password_hash="correct_hash", salt=b"salt", to_dict=lambda: {"id": 1})
    mock_db.session.query().filter().one_or_none.return_value = user
    response, status = process_login_logic({"login": "testuser", "password": "123"})
    assert status == 500
    assert b"Login failed" in response.data
