# chat/tasks.py
from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Room, Message
import logging

User = get_user_model()
logger = logging.getLogger("chat.tasks") # Configure in settings.py if needed

@shared_task
def save_message_task(room_id, user_id, message_content):
    try:
        room = Room.objects.get(id=room_id)
        user = User.objects.get(id=user_id)
        Message.objects.create(room=room, sender=user, content=message_content)
        logger.info(f"Message saved via Celery: room_id={room_id}, user_id={user_id}")
    except Room.DoesNotExist:
        logger.error(f"Task save_message_task: Room with id {room_id} not found.")
    except User.DoesNotExist:
        logger.error(f"Task save_message_task: User with id {user_id} not found.")
    except Exception as e:
        logger.error(f"Error in save_message_task: {e}")