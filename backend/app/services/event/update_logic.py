from flask import jsonify
from app.models.event import Event  # Zakładam, że istnieje
from datetime import datetime

def update_event_logic(db, event_id, request):
    data = request.get_json()
    event = db.session.get(Event, event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    for key in ['title', 'description', 'location_id', 'start_time', 'end_time']:
        if key in data:
            setattr(event, key, data[key])

    event.updated_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Event updated", "event_id": event_id}), 200
