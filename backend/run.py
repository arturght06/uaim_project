"""Start point for Flask app"""
from gunicorn.app.base import BaseApplication
import sys
from app import create_app


class StandaloneApplication(BaseApplication):
    def __init__(self, app, options):
        self.options = options
        self.application = app
        super().__init__()

    def load_config(self):
        for key, value in self.options.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


# PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9002
PORT = 8800

if __name__ == '__main__':
    flask_app = create_app()
    options = {'bind': f'127.0.0.1:{PORT}', 'workers': 4}
    StandaloneApplication(flask_app, options).run()
