from flask import jsonify
from app.models import User, UserRoleEnum
from app.utils.getters import get_user_by_id


def process_get_user_info_logic(db, request, user_id):
    try:
        # Step 1: get looked for user info
        user = get_user_by_id(db, str(user_id))
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Step 2: get asker's User object and check if it has access
        asker: User = get_user_by_id(db, request.user_id)

        if asker and asker.id == user.id:
            return jsonify(user.to_dict()), 200
        elif str(asker.role) == str(UserRoleEnum.admin):
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'error': "You can't ask information about anybody else"}), 404
    except Exception as e:
        return jsonify({'error': "Server error"}), 500
    finally:
        db.session.close()

