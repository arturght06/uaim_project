"""Notifications table model"""
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.extensions import db
import enum


class NotificationStatus(enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class Notification(db.Model):
    """SQLAlchemy Notifications table model"""
    __tablename__ = 'notifications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), doc='Notification unique ID')
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), nullable=False, doc='User ID')
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE'), nullable=False, doc='Event ID')
    title = Column(String(255), nullable=False, doc='Notification title')
    content = Column(Text, nullable=False, doc='Content of the notification')
    type = Column(String(30), nullable=False, default=NotificationStatus.pending.value, doc="Type of notification")
    status = Column(Enum(NotificationStatus), nullable=False, doc='Notification status')
    created_at = Column(DateTime, nullable=False, default=func.now(), doc='Notification initialising time')

    # Relationships
    user = relationship('User', back_populates='notifications')

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, event_id={self.event_id}, type={self.type}, status={self.status})>"
