from django.urls import path
from .views import SignupView, get_chat_history, MessageViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'messages',MessageViewSet, basename='messages')

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("history/<str:room_name>/", get_chat_history),

]+router.urls
