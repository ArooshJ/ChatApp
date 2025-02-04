
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from urllib.parse import parse_qs
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_type = self.scope['url_route']['kwargs']['room_type']
        self.room_identifier = self.scope['url_route']['kwargs'].get('identifier', 'global')

        query_params = parse_qs(self.scope["query_string"].decode())
        self.sender = query_params.get("user", [None])[0]  # Extract 'user' safely

        if not self.sender:
            await self.close()  # Reject connection if no user provided
            return

        # Determine room name based on type
        if self.room_type == 'dm':
            users = sorted([self.sender, self.room_identifier])
            self.room_name = f'dm_{users[0]}-{users[1]}'
        else:
            self.room_name = f'{self.room_type}_{self.room_identifier}'
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Save message to database
        await self.save_message(data['message'])
        
        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message',
                'message': data['message'],
                'sender': self.sender
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'sender': event['sender'],
            'message': event['message']
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    @database_sync_to_async
    def save_message(self, content):
        sender_user = User.objects.get(username=self.sender)

        Message.objects.create(
            room=self.room_name,
            sender=sender_user,
            content=content
        )