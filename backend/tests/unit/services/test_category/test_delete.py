import pytest
from unittest.mock import MagicMock
from app.services.category.delete_logic import delete_category_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_delete_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    response, status = delete_category_logic(db, category_id=1)
    assert status == 404
    assert b"Category not found" in response.data

def test_delete_success():
    db = MagicMock()
    category = MagicMock()
    db.session.query().filter_by().first.return_value = category
    response, status = delete_category_logic(db, category_id=1)
    assert status == 200
    assert b"Category deleted successfully" in response.data

def test_delete_db_error():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = MagicMock()
    db.session.delete.side_effect = Exception("SQL fail")
    response, status = delete_category_logic(db, category_id=1)
    assert status == 500
    assert b"error" in response.data
