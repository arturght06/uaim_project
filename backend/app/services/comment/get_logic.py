from flask import jsonify
from app.models.comment import Comment
from app.models.user import User
from sqlalchemy import asc
import uuid

def get_comments_logic(db, event_id):
    comments = db.session.query(Comment)\
        .filter_by(event_id=uuid.UUID(event_id))\
        .order_by(asc(Comment.created_at)).all()

    result = []

    for c in comments:
        user = db.session.query(User).filter_by(id=c.user_id).first()
        result.append({
            "id": str(c.id),
            "user_id": str(c.user_id),
            "event_id": str(c.event_id),
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "user_data": {"name": user.name, "surname": user.surname}
        })

    return jsonify(result), 200
