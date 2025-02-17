from rest_framework import serializers
from chat.models import Message, UserProfile, Room
from django.contrib.auth.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()  # Custom field
    class Meta:
        model = Message
        fields = '__all__'
    
    def get_sender_name(self, obj):
        return obj.sender.username  # or obj.sender.sender_name if `sender_name` exists


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)  # `create_user` handles password hashing
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Only returning these fields