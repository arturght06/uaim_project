from flask import jsonify
from app.models.comment import Comment
from datetime import datetime
import uuid

def create_comment_logic(db, request):
    data = request.get_json()
    content = data.get("content")
    event_id = data.get("event_id")

    if not content or not event_id:
        return jsonify({"error": "Missing content or event_id"}), 400

    new_comment = Comment(
        id=uuid.uuid4(),
        event_id=uuid.UUID(event_id),
        user_id=request.user_id,
        content=content,
        created_at=datetime.utcnow()
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify({"message": "Comment created", "id": str(new_comment.id)}), 201
