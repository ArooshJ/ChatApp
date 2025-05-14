#!/bin/bash
set -e

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start the application
echo "Starting application server..."
uvicorn dc1.asgi:application --host 0.0.0.0 --port 8000 --workers 4