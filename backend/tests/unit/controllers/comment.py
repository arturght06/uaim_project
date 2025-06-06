import pytest
from flask import Flask
from unittest.mock import patch
from app.controllers.comment import comment_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(comment_bp)
    return app

@patch("app.controllers.comment.get_comments_logic")
def test_get_comments(mock_logic, app):
    mock_logic.return_value = ("Comments", 200)
    with app.test_client() as client:
        res = client.get("/api/comments/1")
        assert res.status_code == 200
