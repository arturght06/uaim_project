from unittest.mock import patch
from app.utils.mailer import send_confirmation_email, send_reminder_email

@patch("app.utils.mailer.mail.send")
@patch("app.utils.mailer.Message")
def test_send_confirmation_email(mock_msg, mock_send):
    send_confirmation_email("test@example.com", "Event", user_name="John", is_reservation=True)
    mock_send.assert_called_once()

@patch("app.utils.mailer.mail.send")
@patch("app.utils.mailer.Message")
def test_send_reminder_email(mock_msg, mock_send):
    send_reminder_email("test@example.com", "Event", "tomorrow", user_name="Anna")
    mock_send.assert_called_once()
