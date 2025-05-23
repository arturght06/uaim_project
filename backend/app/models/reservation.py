"""Event's and user's Reservations tabel model"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.extensions import db


class Reservation(db.Model):
    """Describing Reservation tabel"""
    __tablename__ = 'reservations'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, doc='Unique Reservation\'s id')
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, doc='Connected User\'s id')
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), doc='Connected Event\'s id')
    status = Column(String(20), doc='Reservation status')
    reserved_at = Column(DateTime, nullable=False, default=func.now(), doc='Reservation creation time')

    # Relationships
    user = relationship("User", back_populates="reservations")
    event = relationship("Event", back_populates="reservations")

    def __repr__(self):
        return f"<Reservation(id={self.id}, user_id={self.user_id}, event_id={self.event_id}, status='{self.status}')>"
