# from django.urls import re_path
# from . import consumers

# websocket_urlpatterns = [
#    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
  
# ]
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/global/$', consumers.ChatConsumer.as_asgi(), {'room_type': 'global'}),
    re_path(r'ws/chat/group/(?P<identifier>\w+)/$', consumers.ChatConsumer.as_asgi(), {'room_type': 'group'}),
    re_path(r'ws/chat/dm/(?P<identifier>\w+)/$', consumers.ChatConsumer.as_asgi(), {'room_type': 'dm'}),
]