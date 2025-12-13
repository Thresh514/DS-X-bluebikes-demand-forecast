#!/bin/bash
# Startup script for Gunicorn on Render

echo "Starting Bluebikes Flask API with Gunicorn..."

# Use the PORT environment variable provided by Render, default to 5000
export PORT=${PORT:-5000}

echo "Binding to port $PORT"

# Start Gunicorn with the configuration file
exec gunicorn --config gunicorn_config.py wsgi:app
