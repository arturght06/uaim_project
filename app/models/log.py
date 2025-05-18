"""System logs table"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.extensions import db


class Log(db.Model):
    """Log table"""
    __tablename__ = 'logs'

    id = Column(UUID(as_uuid=True), default=uuid.uuid4(), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), doc="Involved user's ID")
    action = Column(String(255), nullable=False, doc="Log description")
    created_at = Column(DateTime, default=func.now(), doc="Log creation time")
