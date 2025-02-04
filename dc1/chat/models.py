from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    room = models.CharField(max_length=256)  # e.g., "dm_alice-bob" or "group_sports_chat"
    sender = models.ForeignKey(User, on_delete=models.CASCADE)  # Message sender
    content = models.TextField()  # Message content
    timestamp = models.DateTimeField(auto_now_add=True)  # Auto store time

    # class Meta:
    #     # ordering = ['timestamp']  # Messages ordered by time


