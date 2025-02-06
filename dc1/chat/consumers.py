import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from django.contrib.auth.models import User
from .models import Message, Room, UserProfile

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handles WebSocket connection setup."""
        self.room_id = self.scope['url_route']['kwargs']['room_id']

        # Extract user from query params
        query_params = parse_qs(self.scope["query_string"].decode())
        self.sender_username = query_params.get("user", [None])[0]

        if not self.sender_username:
            await self.close()  # Reject connection if no user provided
            return
        
        self.sender = await self.get_user(self.sender_username)
        if not self.sender:
            await self.close()
            return
        
        # Get or validate the room
        self.room = await self.get_or_create_room()
        if not self.room:
            await self.close()
            return

        # Add user to the room if they are not already a member
        await self.add_user_to_room()

        # Join WebSocket channel
        self.room_name = f'room_{self.room.id}'
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        """Handles incoming messages."""
        data = json.loads(text_data)
        message_content = data.get("message", "")

        # Save message asynchronously
        await self.save_message(message_content)

        # Broadcast message
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "message": message_content,
                "sender": self.sender.username
            }
        )

    async def chat_message(self, event):
        """Handles broadcasting messages."""
        await self.send(text_data=json.dumps({
            "sender": event["sender"],
            "message": event["message"]
        }))

    async def disconnect(self, close_code):
        """Handles disconnection."""
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    @database_sync_to_async
    def get_user(self, username):
        """Fetch user from DB."""
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_or_create_room(self):
        """Fetch or create a room."""
        try:
            return Room.objects.get(id=self.room_id)
        except Room.DoesNotExist:
            return None  # Room must be created before use

    @database_sync_to_async
    def add_user_to_room(self):
        """Ensure user is in the room."""
        if not self.room.members.filter(id=self.sender.id).exists():
            self.room.members.add(self.sender)

    @database_sync_to_async
    def save_message(self, content):
        """Save a message to the database."""
        Message.objects.create(room=self.room, sender=self.sender, content=content)
