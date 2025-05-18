"""Event's location tabel model"""
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.extensions import db


class Location(db.Model):
    """Describing Location table"""
    __tablename__ = 'locations'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4(), primary_key=True)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    events = relationship('Event', back_populates='location')

    def __repr__(self):
        return f"<Location(id={self.id}, country='{self.country}', city='{self.city}')>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'country': str(self.country),
            'city': str(self.city),
            'address': str(self.address),
            'created_at': self.created_at,
        }
