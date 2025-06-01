from flask import jsonify
from app.models.reservation import Reservation
from app.models.user import User
from app.models.event import Event
from app.utils.mailer import send_confirmation_email
from sqlalchemy.exc import IntegrityError
import uuid
from app.models.notification import Notification, NotificationStatus
from flask import current_app, url_for
import jwt
import logging

logger = logging.getLogger(__name__)


def create_reservation_logic(db, request):
    try:
        data = request.get_json()
        required_fields = ["user_id", "event_id", "status"]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        user_id = uuid.UUID(data["user_id"])
        event_id = uuid.UUID(data["event_id"])

        # Create reservation
        new_reservation = Reservation(
            user_id=user_id,
            event_id=event_id,
            status=data["status"]
        )

        db.session.add(new_reservation)

        # Get user email and event name
        user = db.session.get(User, user_id)
        event = db.session.get(Event, event_id)

        # Create notification BEFORE committing reservation
        try:
            token_payload = {
                "user_id": str(user_id),
                "event_id": str(event_id)
            }
            token = jwt.encode(token_payload, current_app.config["SECRET_KEY"], algorithm="HS256")

            notification = Notification(
                user_id=user_id,
                event_id=event_id,
                title="Potwierdzenie rezerwacji",
                content=f"Dziękujemy za rezerwację udziału w wydarzeniu {event.title}.",
                type="reservation_confirmation",
                status=NotificationStatus.pending
            )
            db.session.add(notification)
            logger.info(f"Created notification for user {user_id} and event {event_id}")

        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            db.session.rollback()
            return jsonify({"error": f"Failed to create notification: {str(e)}"}), 500

        # Commit both reservation and notification
        db.session.commit()
        logger.info(f"Committed reservation {new_reservation.id} and notification to database")

        if user and event:
            try:
                send_confirmation_email(user.email, event.title, user.name, is_reservation=True)
                notification.status = NotificationStatus.sent
                db.session.commit()
                logger.info(f"Email sent successfully to {user.email}, notification status updated to sent")
            except Exception as e:
                logger.error(f"Email sending failed: {str(e)}")

        return jsonify({
            "message": "Reservation created successfully",
            "id": str(new_reservation.id),
            "notification_id": str(notification.id)
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Database integrity error: {str(e)}")
        return jsonify({"error": "Database integrity error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"General error: {str(e)}")
        return jsonify({"error": str(e)}), 500
