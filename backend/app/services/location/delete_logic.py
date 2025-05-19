import json
from flask import jsonify

from app import UserRoleEnum
from app.models import Location
from app.utils import handle_creation_error
from app.utils.factory.location_factory import create_new_location
from app.utils.getters import get_user_by_id


def create_location_logic(db, request):
    allowed_roles = [str(UserRoleEnum.admin), str(UserRoleEnum.organizer)]

    try:
        data = json.loads(request.get_data())
        new_location: Location = create_new_location(db, data)
        user = get_user_by_id(db, request.user_id)
        if str(user.role) in allowed_roles and bool(new_location):
            if new_location:
                return jsonify(new_location.to_dict()), 200
        else:
            return jsonify({"error": "Not authorized"}, 401)
        return new_location
    except Exception:
        return handle_creation_error()


