import pytest
from unittest.mock import MagicMock
from app.services.category.get_logic import get_categories_logic
from app.models import Category
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield


def test_get_all_categories():
    db = MagicMock()
    mock_category = MagicMock()
    mock_category.id = 1
    mock_category.name = "Test"
    mock_category.description = "Desc"

    db.session.query().all.return_value = [mock_category]

    response, status = get_categories_logic(db)
    assert status == 200
    assert b"Test" in response.data


def test_get_categories_error():
    db = MagicMock()
    db.session.query().all.side_effect = Exception("Database fail")
    response, status = get_categories_logic(db)
    assert status == 500
    assert b"error" in response.data
