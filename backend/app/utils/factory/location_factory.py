from app.models import Location
from app.utils import handle_creation_error


def create_new_location(db, data: dict, user_id) -> Location:
    try:
        country = data.get('country', '').capitalize()
        city = data.get('city', '').capitalize()
        address = data.get('address', '')

        # Check if location already exists for this user
        existing_location = db.session.query(Location).filter_by(
            user_id=user_id,
            country=country,
            city=city,
            address=address
        ).first()
        if existing_location:
            return None  # Signal duplicate

        new_location = Location(
            user_id=user_id,
            country=country,
            city=city,
            address=address
        )
        db.session.add(new_location)
        db.session.commit()
        db.session.refresh(new_location)

        return new_location
    except Exception as e:
        print(e)
        return handle_creation_error()

