from uuid import UUID
from app.models import Location


def get_location_by_id(db, uid: str):
    location: Location = db.session.query(Location).filter_by(id=UUID(uid)).first()
    if location:
        return location
    return None



