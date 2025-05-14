# chat/tasks.py
from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Room, Message
import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer # Addednby gemini

User = get_user_model()
logger = logging.getLogger("chat.tasks") # Configure in settings.py if needed


@shared_task
def process_chat_message(room_id, sender_username, message_content):
    """
    Celery task to save a chat message and broadcast it to the room group.
    """
    # Import necessary Django models and channel layer within the task
    # This is required because Celery tasks run in a separate environment

    User = get_user_model()
    # Use a different logger name for the worker process
    logger = logging.getLogger("chat.worker")

    try:
        # Get the room and sender user from the database
        # Use .objects.get() which is synchronous and safe in a sync task
        room = Room.objects.get(id=room_id)
        sender = User.objects.get(username=sender_username)

        # Save the message to the database
        Message.objects.create(room=room, sender=sender, content=message_content)
        logger.info("Message saved by worker: '%s' from '%s' in room '%s'.", message_content, sender_username, room.name)

        # Get the channel layer instance
        channel_layer = get_channel_layer()

        # Broadcast the message to the room group using the channel layer
        # Use async_to_sync to call the async group_send method from this sync task
        room_group_name = f"chat_{room.id}"
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                "type": "chat_message", # This will call the chat_message method in consumers
                "message": message_content,
                "sender": sender_username,
                "sender_id": sender.id # Assuming sender has an 'id' attribute
            }
        )
        logger.info("Message broadcasted by worker to group %s", room_group_name)

    except Room.DoesNotExist:
        logger.error("Worker: Room with ID %s not found.", room_id)
    except User.DoesNotExist:
        logger.error("Worker: Sender user '%s' not found.", sender_username)
    except Exception as e:
        # Log the full traceback for better debugging in the worker logs
        logger.error("Worker error processing message: %s", e, exc_info=True)

# ... (Start of ChatConsumer class definition) ...

