"""Initialize blueprints"""
from .location import location_bp
from .auth import auth_bp
from .user import user_bp
from .event_category import event_category_bp
from .event import event_bp


def register_blueprints(app):
    """Adds blueprints to the flask app"""
    app.register_blueprint(location_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(event_category_bp)
    app.register_blueprint(event_bp)



