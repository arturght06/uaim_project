"""Necessary Config class for Flask application"""
from dotenv import load_dotenv
import os
from flask import Request


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))



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

    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 'yes']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')


