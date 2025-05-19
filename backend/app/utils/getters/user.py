from uuid import UUID

from app.models import User


def get_user_by_id(db, user_id: str):
    user: User = db.session.query(User).filter_by(id=UUID(user_id)).first()
    if user:
        return user
    return None

