from flask import jsonify
from app.models import Location
from app.models.user import UserRoleEnum  # ← poprawny import
from app.utils.getters import get_user_by_id, get_location_by_id
from app.utils.errors import handle_not_found, handle_server_error


def delete_location_logic(db, uid, request):
    try:
        user = get_user_by_id(db, request.user_id)

        if str(user.role) not in [str(UserRoleEnum.admin), str(UserRoleEnum.organizer)]:
            return jsonify({"error": "Not authorized"}), 401

        location = get_location_by_id(db, uid)
        if not location:
            return handle_not_found("Location")

        db.session.delete(location)
        db.session.commit()

        return jsonify({"message": "Location deleted successfully"}), 200

    except Exception:
        return handle_server_error()
