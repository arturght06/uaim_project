import json
from flask import jsonify
from app.models import UserRoleEnum, Location
from app.utils import handle_creation_error
from app.utils.factory.location_factory import create_new_location
from app.utils.getters import get_user_by_id


def create_location_logic(db, request):
    allowed_roles = [str(UserRoleEnum.admin), str(UserRoleEnum.organizer)]

    try:
        data = json.loads(request.get_data())
        print(data)
        user = get_user_by_id(db, request.user_id)

        # if str(user.role) not in allowed_roles:
        #     return jsonify({"error": "Not authorized"}), 401

        new_location: Location = create_new_location(db, data, request.user_id)
        if new_location is None:
            return jsonify({"error": "Location already exists"}), 409
        if not new_location:
            return jsonify({"error": "Failed to create location"}), 400

        return jsonify(new_location.to_dict()), 200

    except Exception as e:
        print(e)
        return handle_creation_error()
