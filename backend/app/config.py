"""Necessary Config class for Flask application"""
import os
from dotenv import load_dotenv
from flask import Request

# Load environment variables from .env file
load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    REFRESH_SECRET_KEY = os.getenv('REFRESH_SECRET_KEY')

    ACCESS_TOKEN_AGE = int(os.getenv('ACCESS_TOKEN_AGE'))
    REFRESH_TOKEN_AGE = int(os.getenv('REFRESH_TOKEN_AGE'))
    ALGORITHM = "HS256"

    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_size": 20, "max_overflow": 10}

    DEBUG = bool(os.getenv('DEBUG', 'True').lower())

    #Mail notification logic
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'twoj_email@gmail.com'  # <- zamień na swój
    MAIL_PASSWORD = 'twoje_haslo_aplikacji'  # <- hasło aplikacji z Gmaila
    MAIL_DEFAULT_SENDER = 'twoj_email@gmail.com'


