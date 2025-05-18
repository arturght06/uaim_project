"""Initializing necessary objects"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

"""DB"""
db = SQLAlchemy()
migrate = Migrate
