from flask import jsonify
from app.models.comment import Comment
import uuid

def update_comment_logic(db, comment_id, request):
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"error": "Content is required"}), 400

    comment = db.session.query(Comment).filter_by(id=uuid.UUID(comment_id)).first()

    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    if str(comment.user_id) != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    comment.content = content
    db.session.commit()

    return jsonify({"message": "Comment updated", "id": str(comment.id)}), 200
