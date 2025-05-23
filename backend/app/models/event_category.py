"""Many-to-many relationship table between Event and Category"""
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db


class EventCategory(db.Model):
    """Event-Category relationship Model"""
    __tablename__ = 'event_categories'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)

    # Relationships
    event = relationship("Event", back_populates="categories")
    category = relationship("Category", back_populates="events")

    def __repr__(self):
        return f"<EventCategory(id={self.id}, event_id={self.event_id}, category_id={self.category_id})>"
