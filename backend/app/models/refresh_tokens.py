"""Sqlalchemy model for User RefreshToken table"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid


class RefreshToken(db.Model):
    """Sqlalchemy model for refresh_tokens table"""
    __tablename__ = 'refresh_tokens'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), doc='Unique token identifier UUID_v4')
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, doc='Reference to User UUID')
    token = Column(String(255), unique=True, nullable=False, doc='Hashed refresh token value')
    expires_at = Column(DateTime, nullable=False, doc='Token expiration timestamp')
    created_at = Column(DateTime, nullable=False, default=func.now(), doc='Token creation timestamp')
    revoked = Column(Boolean, default=False, doc='Flag indicating if token has been revoked')
    revoked_reason = Column(String(255), doc='Reason for token revocation if applicable')

    # Relationship
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, expires_at='{self.expires_at}', revoked={self.revoked})>"
