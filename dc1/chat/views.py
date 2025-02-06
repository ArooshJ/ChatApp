from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Message, Room, UserProfile
from .serializers import MessageSerializer, RoomSerializer, UserProfileSerializer, SignupSerializer


# 🔹 Basic CRUD ViewSets
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    # ✅ Extra: Get all members of a specific room
    @action(detail=True, methods=["GET"])
    def members(self, request, pk=None):
        room = self.get_object()
        members = room.members.all()
        return Response({"members": [{"id":user.id,"username":user.username} for user in members]})

    # ✅ Extra: Add user to a room
    @action(detail=True, methods=["POST"])
    def add_member(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get("user_id")
        try:
            user = User.objects.get(id=user_id)
            room.members.add(user)
            return Response({"message": f"{user.username} added to {room.name}"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='my_rooms')
    def my_rooms(self, request):
        user = request.user
        rooms = Room.objects.filter(members=user)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available_rooms')
    def available_rooms(self, request):
        user = request.user
        # Return all rooms that are NOT DMs and where the user is not yet a member.
        rooms = Room.objects.filter(is_dm=False).exclude(members=user)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None):
        user = request.user
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        if not room.members.filter(id=user.id).exists():
            return Response({"message": "You are not a member of this room."})
        room.members.remove(user)
        return Response({"message": f"Left room '{room.name}'."}, status=status.HTTP_200_OK)
    
    
    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        user = request.user
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        if room.members.filter(id=user.id).exists():
            return Response({"message": "Already a member of this room."})
        room.members.add(user)
        return Response({"message": f"Joined room '{room.name}'."}, status=status.HTTP_200_OK)

    




class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    # ✅ Extra: Get messages for a specific room
    @action(detail=False, methods=["GET"])
    def room_messages(self, request):
        room_id = request.query_params.get("room_id")
        try:
            messages = Message.objects.filter(room__id=room_id)
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)


# 🔹 Signup API

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 Chat History API (Alternative way of fetching messages for a room)

@api_view(["GET"])
def get_chat_history(request, room_id):
    try:
        messages = Message.objects.filter(room__id=room_id).order_by("timestamp")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
