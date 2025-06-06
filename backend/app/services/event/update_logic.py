from flask import jsonify
from app.models.event import Event

def update_event_logic(db, event_id, request):
    try:
        data = request.get_json()
        event = db.session.query(Event).filter_by(id=event_id).first()

        if not event:
            return jsonify({"message": "Event not found"}), 404

        for key in ['title', 'description', 'location_id', 'event_date']:
            if key in data:
                setattr(event, key, data[key])

        db.session.commit()
        return jsonify({"message": "Event updated", "event_id": event_id}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": e}), 500

