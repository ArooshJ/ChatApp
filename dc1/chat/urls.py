from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SignupView, get_chat_history, 
    MessageViewSet, RoomViewSet, UserProfileViewSet
)

# 🔹 Router for ViewSets
router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='users')
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'messages', MessageViewSet, basename='messages')

# 🔹 Define URL patterns
urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("history/<str:room_name>/", get_chat_history, name="chat_history"),
    path("", include(router.urls)),  # Include router-generated URLs
]
