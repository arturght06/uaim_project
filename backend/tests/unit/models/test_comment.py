from app.models.comment import Comment

def test_create_comment():
    comment = Comment(user_id="1", event_id="2", content="Nice event")
    assert comment.content == "Nice event"
