from django.urls import path
from .discovery import get_server_info

urlpatterns = [
    path('info/', get_server_info, name='discovery_info'),
]
