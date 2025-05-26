"""Initializing necessary objects"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail

"""DB"""
db = SQLAlchemy()
migrate = Migrate
mail = Mail()