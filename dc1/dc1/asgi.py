"""
ASGI config for dc1 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/

"""
'''
Note by Deepseek
Another angle is the structure of the ASGI application. The `asgi.py` file should first set the Django settings, initialize the Django application, and then import other modules that depend on Django. If any module (like `chat.routing` or `chat.consumers`) is imported before Django is initialized, it can cause the app registry not to be ready. The user's `asgi.py` might still be importing `chat.routing` too early.

Wait, in the `asgi.py` provided earlier, after initializing Django, they import `chat.routing`. But if `chat.routing` imports `consumers`, which in turn imports `models`, which uses `get_user_model()`, this chain would happen before Django is fully set up. Even though Django is initialized in `asgi.py`, the act of importing these modules might trigger model loading before the app registry is ready.

So the key is to delay the import of any modules that depend on Django models until after Django is initialized. In the ASGI file, after calling `get_asgi_application()`, which initializes Django, then import the routing and consumers. But sometimes, even that can be too early if the imports are at the top level. To fix this, moving the imports inside the application setup might help, ensuring they happen after Django is ready.

'''

import os
from django.core.asgi import get_asgi_application
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dc1.settings")
application = get_asgi_application()



### CONFIGURE SETTINGS AND GET_ASGI_PPLICATION ALWAYS BEFORE THESE INTERNAL APP IMPORTS !!

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing



application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
