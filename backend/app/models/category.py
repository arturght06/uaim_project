"""Event's category table model"""
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.extensions import db


class Category(db.Model):
    """SQLAlchemy event's category model"""
    __tablename__ = 'categories'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)

    # Category's table relationships
    events = relationship("EventCategory", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"
