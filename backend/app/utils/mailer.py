from flask_mail import Message
from app.extensions import mail

def send_confirmation_email(to, event_name, is_reservation=True):
    subject = "Potwierdzenie " + ("rezerwacji" if is_reservation else "rezygnacji")
    body = (
        f"Dziękujemy za {'rezerwację' if is_reservation else 'rezygnację'} "
        f"udziału w wydarzeniu: {event_name}.\n\nZespół organizacyjny."
    )
    msg = Message(subject, recipients=[to], body=body)
    mail.send(msg)
