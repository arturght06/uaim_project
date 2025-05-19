"""Initialize blueprints"""
from .location import location_bp
from .auth import auth_bp
from .user import user_bp


def register_blueprints(app):
    """Adds blueprints to the flask app"""
    app.register_blueprint(location_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

