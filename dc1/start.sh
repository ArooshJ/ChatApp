#!/bin/bash

echo "Starting Gunicorn with UvicornWorker..."
gunicorn -c gunicorn_config.py myproject.asgi:application
