from app.models import Location
from app.utils import handle_creation_error


def create_new_location(db, data: dict) -> Location:
    try:
        country = data.get('country', '').capitalize()
        city = data.get('city', '').capitalize()
        address = data.get('address', '')

        new_location = Location(
            country=country,
            city=city,
            address=address
        )
        db.session.add(new_location)
        db.session.commit()
        db.session.refresh(new_location)

        return new_location
    except Exception:
        return handle_creation_error()

