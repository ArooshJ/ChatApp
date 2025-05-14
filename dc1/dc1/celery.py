# dc1/celery.py
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dc1.settings')

app = Celery('dc1')

# # --- TEMPORARY TEST LINES ---
# # Explicitly set broker URL and transport for debugging
# from django.conf import settings
# app.conf.broker_url = settings.CELERY_BROKER_URL
# app.conf.broker_transport = settings.CELERY_BROKER_TRANSPORT
# # --- END TEMPORARY TEST LINES ---

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')