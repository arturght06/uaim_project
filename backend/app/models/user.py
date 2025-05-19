"""Sqlalchemy model for Users table"""
from sqlalchemy import Column, Integer, Enum, String, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum


class UserRoleEnum(enum.Enum):
    admin = "admin"
    organizer = "organizer"
    user = "user"


class User(db.Model):
    """Sqlalchemy model for Users table"""
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), doc='Stable User UUID_v4 for all tables')
    username = Column(String(30), unique=True, nullable=False, doc='Username')
    name = Column(String(30), nullable=False, doc='User\'s name')
    surname = Column(String(30), nullable=False, doc='User\'s surname')
    birthday = Column(Date, nullable=False, doc='User\'s birthday date')
    email = Column(String(50), unique=True, nullable=False, doc='User\'s email')
    phone_country_code = Column(String(3), doc='Phone country\'s code')
    phone_number = Column(String(15), doc='Phone number without country code')
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.user, nullable=False, doc='User\'s role')
    salt = Column(String(128), nullable=False, doc='User\'s salt')
    password_hash = Column(String(256), nullable=False, doc='Hash of password')
    created_at = Column(DateTime, nullable=False, default=func.now(), doc='Account creation time')

    # Relationships
    organized_events = relationship("Event", back_populates="organizer")
    reservations = relationship("Reservation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', surname='{self.surname}', email='{self.email}')>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": str(self.username),
            "name": str(self.name),
            "surname": str(self.surname),
            "birthday": self.birthday.isoformat(),
            "email": str(self.email),
            "phone_country_code": str(self.phone_country_code),
            "phone_number": str(self.phone_number),
            "role": str(self.role.value)
        }
