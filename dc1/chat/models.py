from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model() 

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_admin = models.BooleanField(default=False)  # Can be used for managing group admins
    bio = models.TextField(blank=True, null=True)  # Optional user info
    created_at = models.DateTimeField(auto_now_add=True)  # Track profile creation

    def __str__(self):
        return self.user.username

class Room(models.Model):
    name = models.CharField(max_length=255, unique=True, null=True,blank=True)  
    members = models.ManyToManyField(User, related_name="rooms")  
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="admin_rooms")  
    created_at = models.DateTimeField(auto_now_add=True)  
    is_dm = models.BooleanField(default=False)  # True if it is a DM room.

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="messages")  
    sender = models.ForeignKey(User, on_delete=models.CASCADE)  
    content = models.TextField()  
    timestamp = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"
