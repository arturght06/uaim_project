"""Initialisation and configuring Flask app"""
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request
from .config import Config
from . import extensions
from .controllers import register_blueprints
from .models import *


def create_app(config_class=Config):
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Logger customization
    file_handler = RotatingFileHandler("app.log", maxBytes=100000, backupCount=3)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(
        "[%(asctime)s] %(levelname)s - %(message)s"
    ))
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)

    """Initialize db models"""
    extensions.db.init_app(app)

    with app.app_context():
        extensions.migrate(app, extensions.db)
        extensions.db.Model.metadata.create_all(bind=extensions.db.engine)
        extensions.db.create_all()
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 280,
        'pool_size': 10,
        'pool_timeout': 30,
        'max_overflow': 10,
    }
    # migrate.init_app(app, db)

    """Registration Flask blueprints"""
    register_blueprints(app)

    return app
