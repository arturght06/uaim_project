import pytest
from unittest.mock import MagicMock, patch
from app.services.auth.user_logic import process_get_user_info_logic
from app.models import UserRoleEnum
from app import create_app

# funkcja automatycznie uruchamiana przed każdym testem — tworzy kontekst aplikacji Flask
@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

# Test sprawdza, czy funkcja zwraca 404, gdy użytkownik o podanym ID nie istnieje
@patch("app.services.auth.user_logic.get_user_by_id")
def test_user_not_found(mock_get):
    mock_get.return_value = None
    response, status = process_get_user_info_logic(MagicMock(), MagicMock(user_id=1), 2)
    assert status == 404
    assert b"User not found" in response.data

# Test sprawdza, czy użytkownik może pobrać swoje własne dane
@patch("app.services.auth.user_logic.get_user_by_id")
def test_same_user_access(mock_get):
    user = MagicMock(id=1, to_dict=lambda: {"id": 1})
    mock_get.side_effect = [user, user]  # pierwszy dla user_id, drugi dla request.user_id
    response, status = process_get_user_info_logic(MagicMock(), MagicMock(user_id=1), 1)
    assert status == 200
    assert b"id" in response.data

# Test sprawdza, czy administrator może pobrać dane innego użytkownika
@patch("app.services.auth.user_logic.get_user_by_id")
def test_admin_access(mock_get):
    target_user = MagicMock(id=2, to_dict=lambda: {"id": 2})
    admin = MagicMock(id=1, role=UserRoleEnum.admin)
    mock_get.side_effect = [target_user, admin]
    response, status = process_get_user_info_logic(MagicMock(), MagicMock(user_id=1), 2)
    assert status == 200
    assert b"id" in response.data

# Test sprawdza, czy zwykły użytkownik nie ma dostępu do cudzych danych
@patch("app.services.auth.user_logic.get_user_by_id")
def test_no_permission(mock_get):
    target_user = MagicMock(id=2, to_dict=lambda: {"id": 2})
    asker = MagicMock(id=3, role="user")  # nie admin, nie ten sam użytkownik
    mock_get.side_effect = [target_user, asker]
    response, status = process_get_user_info_logic(MagicMock(), MagicMock(user_id=3), 2)
    assert status == 404
    assert b"You can't ask" in response.data

# Test sprawdza, czy wyjątki są obsługiwane i zwracany jest błąd 500
@patch("app.services.auth.user_logic.get_user_by_id", side_effect=Exception("unexpected"))
def test_exception_handling(mock_get):
    response, status = process_get_user_info_logic(MagicMock(), MagicMock(user_id=1), 2)
    assert status == 500
    assert b"Server error" in response.data
