from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# ---------------------------------------- Serializer ------------------------------------------------------------------------------------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user details to serializer
        data.update({
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email,
            }
        })
        return data


#----------------------------------Views---------------------------------------------------------------------------------------------------------------------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data

        user = serializer.user  # Get the authenticated user
        
        return Response({
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)
