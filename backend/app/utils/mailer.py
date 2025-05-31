from flask_mail import Message
from app.extensions import mail

def send_confirmation_email(to, event_name, user_name=None, is_reservation=True):
    subject = "Potwierdzenie " + ("rezerwacji" if is_reservation else "rezygnacji")

    greeting = f"Cześć {user_name}," if user_name else "Cześć,"
    body = (
        f"{greeting}\n\n"
        f"Dziękujemy za {'rezerwację' if is_reservation else 'rezygnację'} udziału w wydarzeniu: {event_name}.\n\n"
        f"Zespół EVE.nt"
    )
    msg = Message(subject, recipients=[to], body=body)
    mail.send(msg)

def send_reminder_email(to, event_name, date, user_name=None):
    subject = "Przypomnienie o wydarzeniu"

    greeting = f"Cześć {user_name}," if user_name else "Cześć,"
    body = (
        f"{greeting}\n\n"
        f"Przypominamy o nadchodzącym wydarzeniu: {event_name}, "
        f"które odbędzie się {date}.\n\n"
        f"Do zobaczenia!\nZespół EVE.nt"
    )
    msg = Message(subject, recipients=[to], body=body)
    mail.send(msg)
