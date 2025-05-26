from flask import Blueprint, request, jsonify
from app.utils.mailer import send_confirmation_email

test_email_bp = Blueprint("test_email", __name__, url_prefix="/test")

@test_email_bp.route("/email", methods=["POST"])
def test_email():
    data = request.get_json()
    email = data.get("email")
    event_name = data.get("event_name", "Testowe Wydarzenie")
    is_reservation = data.get("is_reservation", True)

    if not email:
        return jsonify({"error": "Brakuje adresu email"}), 400

    try:
        send_confirmation_email(email, event_name, is_reservation)
        return jsonify({"message": f"E-mail testowy wysłany na {email}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
