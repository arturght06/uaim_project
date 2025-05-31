from flask import jsonify
from app.models.comment import Comment
import uuid

def delete_comment_logic(db, comment_id, request):
    comment = db.session.query(Comment).filter_by(id=uuid.UUID(comment_id)).first()

    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    if str(comment.user_id) != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted"}), 200
