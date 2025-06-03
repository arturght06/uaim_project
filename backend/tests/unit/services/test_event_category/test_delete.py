import pytest
from unittest.mock import MagicMock
from app.services.event_category.delete_logic import delete_event_category_relation_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_delete_not_found():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = None
    response, status = delete_event_category_relation_logic(db, "1")
    assert status == 404
    assert b"Relation not found" in response.data

def test_delete_success():
    db = MagicMock()
    db.session.query().filter_by().first.return_value = MagicMock()
    response, status = delete_event_category_relation_logic(db, "1")
    assert status == 200
    assert b"Relation deleted" in response.data
