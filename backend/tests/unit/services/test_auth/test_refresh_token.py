import pytest
from unittest.mock import patch, MagicMock
from app.services.auth.refresh_token_logic import process_refreshing_token_logic
from app.models import User
from app import create_app

# Fixture: zapewnia kontekst requestu Flask dla każdego testu
@pytest.fixture(autouse=True)
def flask_test_request():
    app = create_app()
    with app.test_request_context(json={"refresh_token": "abc"}):
        yield

# Test: brak tokena w danych
def test_missing_refresh_token():
    response, status = process_refreshing_token_logic({})
    assert status == 400
    assert b"Invalid or expired refresh token" in response.data


# Test: nieprawidłowy lub wygasły refresh token
@patch("app.services.auth.refresh_token_logic.sha512_hash", return_value="hashed")
@patch("app.services.auth.refresh_token_logic.db")
def test_invalid_token(mock_db, mock_hash):
    mock_db.session.query().filter().first.return_value = None
    response, status = process_refreshing_token_logic({"refresh_token": "abc"})
    assert status == 400
    assert b"Invalid or expired refresh token" in response.data

# Test: token jest poprawny, ale użytkownik już nie istnieje
@patch("app.services.auth.refresh_token_logic.create_refresh_token_for_user", return_value="new_refresh")
@patch("app.services.auth.refresh_token_logic.create_access_token", return_value="new_access")
@patch("app.services.auth.refresh_token_logic.sha512_hash", return_value="hashed")
@patch("app.services.auth.refresh_token_logic.db")
def test_user_not_found(mock_db, mock_hash, mock_access, mock_refresh):
    token = MagicMock(user_id=1)
    mock_db.session.query().filter().first.side_effect = [token, None]
    response, status = process_refreshing_token_logic({"refresh_token": "abc"})
    assert status == 401
    assert b"User not found" in response.data

# Test: poprawne odświeżenie tokena
@patch("app.services.auth.refresh_token_logic.create_refresh_token_for_user", return_value="new_refresh")
@patch("app.services.auth.refresh_token_logic.create_access_token", return_value="new_access")
@patch("app.services.auth.refresh_token_logic.sha512_hash", return_value="hashed")
@patch("app.services.auth.refresh_token_logic.db")
def test_successful_refresh(mock_db, mock_hash, mock_access, mock_refresh):
    user = MagicMock(spec=User, id=1, to_dict=lambda: {"id": 1, "username": "test"})
    token = MagicMock(user_id=1)
    mock_db.session.query().filter().first.side_effect = [token, user]
    response, status = process_refreshing_token_logic({"refresh_token": "abc"})
    assert status == 200
    assert b"access_token" in response.data
    assert b"refresh_token" in response.data

# Test: wyjątek w czasie przetwarzania
@patch("app.services.auth.refresh_token_logic.sha512_hash", side_effect=Exception("Unexpected"))
def test_exception(mock_hash):
    response, status = process_refreshing_token_logic({"refresh_token": "abc"})
    assert status == 400
    assert b"Unknown server error!" in response.data
