import pytest
from unittest.mock import MagicMock, patch
from app.services.category.create_logic import create_category_logic
from app.models import Category
from app import create_app

@pytest.fixture(autouse=True)
def flask_app_context():
    app = create_app()
    with app.app_context():
        yield


@pytest.fixture
def app_context():
    app = create_app()
    with app.test_request_context(json={"name": "Test", "description": "Test description"}):
        yield

@patch("app.services.category.create_logic.is_valid_name", return_value=False)
def test_invalid_name(mock_validator):
    db = MagicMock()
    request = MagicMock(get_json=lambda: {"name": "", "description": "Test"})
    response, status = create_category_logic(db, request)
    assert status == 400
    assert b"Invalid or missing category name" in response.data

def test_missing_description():
    db = MagicMock()
    request = MagicMock(get_json=lambda: {"name": "ValidName"})
    response, status = create_category_logic(db, request)
    assert status == 400
    assert b"Missing description" in response.data

@patch("app.services.category.create_logic.is_valid_name", return_value=True)
def test_category_already_exists(mock_validator):
    db = MagicMock()
    db.session.query().filter_by().first.return_value = True
    request = MagicMock(get_json=lambda: {"name": "Test", "description": "Something"})
    response, status = create_category_logic(db, request)
    assert status == 409
    assert b"Category already exists" in response.data

@patch("app.services.category.create_logic.is_valid_name", return_value=True)
def test_successful_creation(mock_validator):
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    new_category = MagicMock(id=1)
    with patch("app.services.category.create_logic.Category", return_value=new_category):
        request = MagicMock(get_json=lambda: {"name": "Test", "description": "Description"})
        response, status = create_category_logic(db, request)
        assert status == 201
        assert b"Category created successfully" in response.data
        assert b"id" in response.data

@patch("app.services.category.create_logic.is_valid_name", return_value=True)
def test_integrity_error(mock_validator):
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    db.session.add.side_effect = Exception("IntegrityError")  # Simulating SQLAlchemy error
    request = MagicMock(get_json=lambda: {"name": "Test", "description": "Desc"})
    response, status = create_category_logic(db, request)
    assert status == 500
    assert b"error" in response.data
