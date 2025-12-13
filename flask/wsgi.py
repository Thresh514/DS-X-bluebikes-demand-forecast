"""
WSGI entry point for Gunicorn
This file is used by Gunicorn to start the Flask application
"""

from app import app

if __name__ == "__main__":
    app.run()
