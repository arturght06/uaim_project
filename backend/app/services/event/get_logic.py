from flask import jsonify, request
from app.models.event import Event
from app.models.user import User
from app.models.location import Location
from app.models.reservation import Reservation
from app.models.event_category import EventCategory
from app.models.comment import Comment
from sqlalchemy.exc import SQLAlchemyError

# Add extra data to event object to improve performance
def add_event_data(db, event):
    d = event.to_dict()
    org = db.session.query(User).filter_by(id=event.organizer_id).first()
    d.update({"organizer_data": {"name": org.name, "surname": org.surname}})
    loc = db.session.query(Location).filter_by(id=event.location_id).first()
    d.update({"location_data": loc.to_dict()})
    res_count = db.session.query(Reservation).filter_by(event_id=event.id).count()
    d.update({"reservation_count": res_count})
    uuid = request.headers.get('Useruuid', None)
    if uuid:
        res = db.session.query(Reservation).filter_by(user_id=uuid, event_id=event.id).first()
        if res:
            d.update({"reservation": res.status})
    com_count = db.session.query(Comment).filter_by(event_id=event.id).count()
    d.update({"comment_count": com_count})
    return d

def get_all_events_logic(db, categories=None, sort_by=None, sort_order='asc'):
    try:
        if categories and sort_by in ['comments', 'participants']:
            category_filtered_events = db.session.query(Event.id)\
                .join(EventCategory, Event.id == EventCategory.event_id)\
                .filter(EventCategory.category_id.in_(categories))\
                .distinct().subquery()
            
            if sort_by == 'comments':
                comment_counts = db.session.query(
                    Event.id,
                    db.func.coalesce(db.func.count(Comment.id), 0).label('count')
                ).filter(Event.id.in_(db.session.query(category_filtered_events.c.id)))\
                 .outerjoin(Comment, Event.id == Comment.event_id)\
                 .group_by(Event.id).subquery()
                
                query = db.session.query(Event)\
                    .join(comment_counts, Event.id == comment_counts.c.id)
                
                if sort_order == 'desc':
                    query = query.order_by(comment_counts.c.count.desc())
                else:
                    query = query.order_by(comment_counts.c.count.asc())
                    
            elif sort_by == 'participants':
                reservation_counts = db.session.query(
                    Event.id,
                    db.func.coalesce(db.func.count(Reservation.id), 0).label('count')
                ).filter(Event.id.in_(db.session.query(category_filtered_events.c.id)))\
                 .outerjoin(Reservation, Event.id == Reservation.event_id)\
                 .group_by(Event.id).subquery()
                
                query = db.session.query(Event)\
                    .join(reservation_counts, Event.id == reservation_counts.c.id)
                
                if sort_order == 'desc':
                    query = query.order_by(reservation_counts.c.count.desc())
                else:
                    query = query.order_by(reservation_counts.c.count.asc())
        else:
            query = db.session.query(Event)
            
            if categories:
                query = query.join(EventCategory, Event.id == EventCategory.event_id)\
                            .filter(EventCategory.category_id.in_(categories))\
                            .distinct()
            
            if sort_by == 'date':
                if sort_order == 'desc':
                    query = query.order_by(Event.event_date.desc())
                else:
                    query = query.order_by(Event.event_date.asc())
            elif sort_by == 'comments':
                comment_count = db.session.query(Comment.event_id, db.func.count(Comment.id).label('count'))\
                                        .group_by(Comment.event_id).subquery()
                query = query.outerjoin(comment_count, Event.id == comment_count.c.event_id)
                if sort_order == 'desc':
                    query = query.order_by(db.func.coalesce(comment_count.c.count, 0).desc())
                else:
                    query = query.order_by(db.func.coalesce(comment_count.c.count, 0).asc())
            elif sort_by == 'participants':
                reservation_count = db.session.query(Reservation.event_id, db.func.count(Reservation.id).label('count'))\
                                             .group_by(Reservation.event_id).subquery()
                query = query.outerjoin(reservation_count, Event.id == reservation_count.c.event_id)
                if sort_order == 'desc':
                    query = query.order_by(db.func.coalesce(reservation_count.c.count, 0).desc())
                else:
                    query = query.order_by(db.func.coalesce(reservation_count.c.count, 0).asc())
            else:
                query = query.order_by(Event.event_date.asc())
        
        events = query.all()
        return jsonify([add_event_data(db, event) for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_events_logic(db, user_id):
    try:
        # Events organized by the user
        organized_events = db.session.query(Event).filter_by(organizer_id=user_id).all()

        # Events the user has registered for
        reserved_event_ids = db.session.query(Reservation.event_id).filter_by(user_id=user_id).distinct()
        reserved_events = db.session.query(Event).filter(Event.id.in_(reserved_event_ids)).all()

        # Combine and remove duplicates
        all_events = {event.id: event for event in organized_events + reserved_events}.values()

        # Sort by event date (assuming 'date' is a datetime field on the Event model)
        sorted_events = sorted(all_events, key=lambda e: e.event_date)

        # Convert to JSON
        return jsonify([add_event_data(db, event) for event in sorted_events]), 200

        return jsonify([add_event_data(db, event) for event in all_events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_category_events_logic(db, category_id):
    try:
        events = db.session.query(Event).\
            join(EventCategory, Event.id == EventCategory.event_id).\
            filter(EventCategory.category_id == category_id).\
            order_by(Event.event_date.desc()).all()

        return jsonify([add_event_data(db, event) for event in events]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_event_by_id_logic(db, event_id):
    try:
        event = db.session.query(Event).filter_by(id=event_id).first()

        if not event:
            return jsonify({"error": "Event not found"}), 404

        return jsonify(add_event_data(db, event)), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
