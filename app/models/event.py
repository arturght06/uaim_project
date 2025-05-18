"""SQLAlchemy Events table's model"""
import uuid
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db


class Event(db.Model):
    """SQLAlchemy Events table"""
    __tablename__ = 'events'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4(), primary_key=True)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey('locations.id'), nullable=False)
    max_participants = Column(Integer)
    description = Column(Text)
    event_date = Column(DateTime, nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Describe relationships
    organizer = relationship("User", back_populates="organized_events")
    location = relationship("Location", back_populates="events")
    categories = relationship("EventCategory", back_populates="event")
    reservations = relationship("Reservation", back_populates="event")

    def __repr__(self):
        return f"<Event(id={self.id}, title='{self.title}', event_date='{self.event_date}')>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'organizer_id': str(self.organizer_id),
            'location_id': str(self.location_id),
            'max_participants': self.max_participants,
            'description': self.description,
            'event_date': self.event_date,
            'title': str(self.title),
            'created_at': self.created_at
        }
