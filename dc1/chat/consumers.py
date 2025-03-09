import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from chat.models import Room, Message

User = get_user_model()
logger = logging.getLogger("chat.consumer")  # configure logging in your settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Parse query parameters
        query_params = parse_qs(self.scope["query_string"].decode())
        logger.info("WS connect query_params: %s", query_params)
        # print("connected")

        # Try to get the sender from scope; if not authenticated, fallback to query param "user"
        self.user = self.scope.get("user", None)
        if not (self.user and self.user.is_authenticated):
            sender_username = query_params.get("user", [None])[0]
            if not sender_username:
                logger.error("Connection rejected: no authenticated user and no 'user' query parameter provided.")
                # print("Connection rejected: no authenticated user and no 'user' query parameter provided.")
                await self.close()
                return
            self.user = await self.get_user(sender_username)
            if not self.user:
                logger.error("Connection rejected: sender '%s' not found in DB.", sender_username)
                # print("Connection rejected: sender '%s' not found in DB.", sender_username)
                await self.close()
                return

        # Determine if this is a DM or a Group Chat.
        # receiver_username = query_params.get("receiver", [None])[0]
        room_id = self.scope["url_route"]["kwargs"].get("room_id", None)
        if room_id:
            # GROUP CHAT MODE: get or create a group chat room using room_id (as string)
            self.room = await self.get_room(room_id)
            if not await self.user_in_room(self.user, self.room):
                logger.error("User '%s' is not a member of group room '%s'.", self.user.username, self.room.name)
                await self.close()
                return
        else:
            logger.error("Connection rejected: room_id not provided.")
            # print("Connection rejected: room_id not provided.")

            await self.close()
            return

        # Assigining Channel room group name
        self.room_group_name = f"chat_{self.room.id}"
        logger.info("User '%s' connecting to room '%s' (group: %s)", self.user.username, self.room.name, self.room_group_name)
        # print("User '%s' connecting to room '%s' (group: %s)", self.user.username, self.room.name, self.room_group_name)


        # Ensure the user is added to the room
        if not await self.user_in_room(self.user, self.room):
            # await self.add_user_to_room(self.user, self.room)
            # print("Connection rejected: You are not a member of the room.")
            await self.close()
            return

        # Join the channel layer group,  Group add basically adds a user (channel of the user) to the group, and not create a new group. It creates a new group auto if a group name doesnt exist
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        # print("WebSocket connection accepted for user '%s' in room '%s'.", self.user.username, self.room.name)

    async def disconnect(self, close_code):
        # print(f"Calling Disconnect!! ")
        if hasattr(self, "room_group_name"):
            # print(f"disconnected {self.channel_name} {self.user.username}, {self.room_group_name}")
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
           
        logger.info("User '%s' disconnected from room '%s'.", self.user.username, self.room.name if hasattr(self, "room") else "unknown")

    async def receive(self, text_data):
        # print(f"recieve called")
        # Text data can be text data, but here is expected as json
        try:
            data = json.loads(text_data)
            # print(f"recieved data {data}")
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON received: %s", e)
            # print("Invalid JSON received: %s", e)

            return
        
        # extract message string from json
        message = data.get("message", "").strip()
        # print(message)

        if not message:
            logger.info("Empty message received; ignoring.")
            # print("Empty message received; ignoring.")

            return
        
        # Check if sender is in the room.
        if not await self.user_in_room(self.user, self.room):
            logger.error("User '%s' tried to send a message in room '%s' but is not a member.", self.user.username, self.room.name)
            # print("User '%s' tried to send a message in room '%s' but is not a member.", self.user.username, self.room.name)

            return

        # Save the message in the database.
        await self.save_message(self.room, self.user, message)
        logger.info("Message saved: '%s' from '%s' in room '%s'.", message, self.user.username, self.room.name)

        # Broadcast the message to the group.
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message", # THis is handled by chat_message function, basically an event is sent to the group which is handled by chat message func
                "message": message,
                "sender": self.user.username,
                "sender_id":self.user.id
        
            }
        )

    # Used to handle
    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                "message": event["message"],
                "sender": event["sender"],
                "sender_id":event["sender_id"],
            }))
        except Exception as e:
            logger.error("Error sending message to WebSocket: %s", e)
            # # print("Error sending message to WebSocket: %s", e)
            await self.close()
            

    @database_sync_to_async
    def get_user(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
    @database_sync_to_async
    def get_room(self, room_id):
        try:
            # # print(f"Getting Room")
            room =  Room.objects.get(id=room_id)
            # # print(f"Got room")
            return room
            
        except Room.DoesNotExist:
            return None


    @database_sync_to_async
    def user_in_room(self, user, room):
        # # print(f"user in room?")

        r = room.members.filter(id=user.id).exists()
        # print(f"got r")
        return r

    # @database_sync_to_async
    # def add_user_to_room(self, user, room):
    #     room.members.add(user)

    @database_sync_to_async
    def save_message(self, room, user, message):
        Message.objects.create(room=room, sender=user, content=message)
