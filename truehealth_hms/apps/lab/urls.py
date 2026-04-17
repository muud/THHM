from django.urls import path
from . import views

app_name = 'lab'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('request/', views.request_lab_test, name='request'),
    path('my-results/', views.my_lab_results, name='my_results'),
]
