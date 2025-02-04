from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Message
from django.contrib.auth.models import User
from .serializers import MessageSerializer, SignupSerializer
from rest_framework import status,viewsets
from rest_framework.views import APIView

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer



@api_view(['GET'])
def get_chat_history(request, room_name):
    # print("room_name received:", room_name)
    # print("Request data:", request.data)
    # print("Parser context:", request.parser_context)  # Helps debug
    messages = Message.objects.filter(room=room_name)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)