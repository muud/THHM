from django.urls import path
from . import views

app_name = 'appointments'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('available-slots/', views.available_slots, name='available_slots'),
    path('book/', views.book_appointment, name='book'),
    path('check-in/', views.check_in_api, name='check_in'),
    path('queue/', views.queue_list_api, name='queue_list'),
    path('update-status/<int:pk>/', views.update_visit_status_api, name='update_status'),
    path('my-appointments/', views.my_appointments, name='my_appointments'),
]
