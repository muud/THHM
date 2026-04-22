import os
import sys
from pathlib import Path
from decouple import config
import dj_database_url

# CRITICAL: Python 3.14 compatibility patch for Django 4.2
# Fixes AttributeError: 'super' object has no attribute 'dicts' in django.template.context
import django.template.context
import copy

def django_context_copy_fix(self):
    # Manual copy logic for Python 3.14+ compatibility
    # Creates a new instance of the same class without calling __init__
    cls = self.__class__
    duplicate = cls.__new__(cls)
    # Copy all internal state except the nested dicts list which needs manual handling
    duplicate.__dict__.update(self.__dict__)
    if hasattr(self, 'dicts'):
        duplicate.dicts = self.dicts[:]
    return duplicate

# Apply the patch to BaseContext
django.template.context.BaseContext.__copy__ = django_context_copy_fix

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.ngrok-free.dev', '.ngrok.io', 'testserver']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'corsheaders',

    # Your apps
    'apps.core',
    'apps.patients',
    'apps.appointments',
    'apps.pharmacy',
    'apps.lab',
    'apps.radio',
    'apps.dashboard',
    'apps.staff',
    'apps.cdss',
    'apps.beds',
    'apps.maternity',
    'apps.immunization',
    'apps.billing',
    'apps.insurance',
    'apps.management',
]

# Custom User Model
AUTH_USER_MODEL = 'core.User'

AUTHENTICATION_BACKENDS = [
    'apps.core.backends.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # if you have whitenoise
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', BASE_DIR / 'static'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Database configuration - using PostgreSQL for production if DATABASE_URL is set, else SQLite
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise compression and caching support
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/models/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# Authentication Redirects
LOGIN_REDIRECT_URL = 'role_redirect'
LOGIN_URL = '/admin/login/'
LOGOUT_REDIRECT_URL = '/'

# CORS Configuration
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://127.0.0.1:5173').split(',')
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost:5173,http://127.0.0.1:5173').split(',')
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# Production Security
if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'

