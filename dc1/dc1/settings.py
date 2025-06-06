"""
Django settings for dc1 project.

Generated by 'django-admin startproject' using Django 5.1.5.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
from urllib.parse import urlparse


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-^a&#_4fp6n1cwb)%9qb(@+%_&3scf^07sg!f384n*t#ss@j44$"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False # false for prod, trye for dev
APPEND_SLASH = False

# ALLOWED_HOSTS = ['*'] # Blank By default, '* to allow all hosts
ALLOWED_HOSTS = [
    "backend",  # For Docker Compose (Nginx calling Django)
  #  "yourdomain.com",  # Replace with your production domain
    "your-render-subdomain.onrender.com",
    "localhost",
    "127.0.0.1",
    "nginx",
]



# Application definition

INSTALLED_APPS = [
    "daphne", #installed
    "channels", # installed
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",# installed
    'rest_framework',# installed
    "chat", # own app
   

]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'corsheaders.middleware.CorsMiddleware', # manually added
]

ROOT_URLCONF = "dc1.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = 'dc1.asgi.application' # manually_added.
WSGI_APPLICATION = "dc1.wsgi.application"




# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# THE OG SQLITE
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }

# local mysql database, that can be accessed by other device on same network
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'chatapp',  # Change to your actual database name
#         'USER': 'lanuser',    # Change to your MySQL user
#         'PASSWORD': 'password',  # Change to your MySQL password
#         'HOST': '192.168.1.9',  # IP of the MySQL host machine
#         'PORT': '3306',
#     }
# }

# Docker Compose Database

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("MYSQL_DATABASE", "chatdb"),
        "USER": os.getenv("MYSQL_USER", "chatuser"),
        "PASSWORD": os.getenv("MYSQL_PASSWORD", "chatpass"),
        "HOST": os.getenv("MYSQL_HOST", "db"),  # Matches MySQL container name in `docker-compose.yml`
        "PORT": os.getenv("MYSQL_PORT", "3306"),
    }
}


# # Neon DB database --> Latency Issues
# tmpPostgres = urlparse(os.getenv("DATABASE_URL"))
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': tmpPostgres.path.replace('/', ''),
#         # 'NAME': tmpPostgres.path.decode('utf-8').replace('/', ''),
#         'USER': tmpPostgres.username,
#         'PASSWORD': tmpPostgres.password,
#         'HOST': tmpPostgres.hostname,
#         'PORT': 5432,
#     }
# }



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/


STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")  # Where `collectstatic` places files

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")  # Media uploads


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_ALL_ORIGINS = True


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

 
# JWT used for auth - copied from jwt website
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=20),
    "ROTATE_REFRESH_TOKENS": True, # Generates a new refresh token each time a user logs in
    "BLACKLIST_AFTER_ROTATION": True, # Blacklists (Bans) the previous refresh token for the same user once a new one is generated
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    # "SIGNING_KEY": settings.SECRET_KEY, # remmoved but exists by default....
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5), # access token lifetime
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

# Channel layers (for development, use in-memory)
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels.layers.InMemoryChannelLayer",
#         # "CONFIG": {
#         #     "hosts": [("127.0.0.1", 6379)],
#         # },
#     }
# }

# For production (o)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)], # Redis container name in docker-compose.yml
        },
    },
}

# Recommended by GPT For Prodcution
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = False  # Redirect HTTP to HTTPS
SESSION_COOKIE_SECURE = True  # Send cookies only over HTTPS
CSRF_COOKIE_SECURE = True  # Send CSRF cookie only over HTTPS
CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1", "http://localhost"]


# ... (content above, including CHANNEL_LAYERS) ...

# Celery Configuration
# See: https://docs.celeryq.dev/en/stable/userguide/configuration.html

# CELERY_BROKER_URL: The URL for the message broker.
# We use Redis, and 'redis' is the service name in docker-compose.
# 'redis://redis:6379/0' specifies Redis on the 'redis' host, port 6379, database 0.
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_BROKER_TRANSPORT = 'redis'
# CELERY_RESULT_BACKEND: The URL for storing task results. Optional, but useful.
# Using a different database index (e.g., /1) is common to separate results from broker messages.
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis_cache:6379/1")

# CELERY_ACCEPT_CONTENT: List of content types that may be accepted.
# JSON is recommended as it's interoperable.
CELERY_ACCEPT_CONTENT = ["json"]

# CELERY_TASK_SERIALIZER: How task messages are serialized.
# JSON is recommended.
CELERY_TASK_SERIALIZER = "json"

# CELERY_RESULT_SERIALIZER: How task results are serialized.
# JSON is recommended.
CELERY_RESULT_SERIALIZER = "json"

# CELERY_TIMEZONE: Set the timezone for Celery.
# It's best practice to match Django's TIME_ZONE.
CELERY_TIMEZONE = TIME_ZONE

# ... (any content below, like LOGGING) ...

# # For logging errors in consumer

LOGS_DIR = "/app/logs"
os.makedirs(LOGS_DIR, exist_ok=True)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            # "filename": os.path.join(BASE_DIR, "chat_debug.log"),  # Logs to file
            "filename": "/app/logs/chat_debug.log",
            "formatter": "verbose",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "chat.consumer": {  # Logger for ChatConsumer
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "channels": {  # Logger for Django Channels
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}