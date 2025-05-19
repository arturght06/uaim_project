"""Database utilities for temporary database operations"""
import os
from datetime import date, datetime
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, scoped_session
from contextlib import contextmanager
from app.extensions import db
from app.models import User

# Database configuration
TEST_DB_PATH = "test.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"


@contextmanager
def temp_db_session():
    """Context manager for temporarily database operations"""
    engine = create_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    db.Model.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = scoped_session(session_factory)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
        session.remove()
        db.Model.metadata.drop_all(bind=engine)
        engine.dispose()

        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)


def add_user(session, user: User):
    """Add a user to the database"""
    session.add(user)
    session.commit()
    session.refresh(user)
    session.close()
    return user


# Function to get all users
def get_users(session):
    """Get all users from database"""
    users = session.query(User).all()
    session.close()
    return users


# Example user data
user_data = {
    "username": "username1",
    "name": "John",
    "surname": "Doe",
    "birthday": date(1990, 5, 15),
    "email": "john.doe@example.com",
    "phone_country_code": "+1",
    "phone_number": "5551234567",
    "salt": "salt",
    "password_hash": "some_secure_hash",
    "created_at": datetime.now()  # if you want to override the default. otherwise it will be set by the db.
}


# Example usage
if __name__ == "__main__":
    with temp_db_session() as session:
        new_user = User(**user_data)
        add_user(session, new_user)
        users = get_users(session)
        for user in users:
            print(user.role.__repr__())
            print(user.id, user.name, user.email)
