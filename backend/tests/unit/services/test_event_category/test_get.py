import pytest
from unittest.mock import MagicMock
from app.services.event_category.get_logic import get_event_category_relations_logic
from app import create_app

@pytest.fixture(autouse=True)
def app_context():
    app = create_app()
    with app.app_context():
        yield

def test_get_relations_success():
    db = MagicMock()
    relation = MagicMock(id="1", event_id="e1", category_id="c1")
    db.session.query().all.return_value = [relation]
    response, status = get_event_category_relations_logic(db)
    assert status == 200
    assert b"e1" in response.data

def test_get_relations_error():
    db = MagicMock()
    db.session.query().all.side_effect = Exception("fail")
    response, status = get_event_category_relations_logic(db)
    assert status == 500
    assert b"error" in response.data
