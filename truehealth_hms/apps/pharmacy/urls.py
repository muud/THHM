from django.urls import path
from . import views

app_name = 'pharmacy'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('staff/dashboard/', views.staff_dashboard, name='staff_dashboard'),
    path('api/pharmacy/dispense/', views.dispense_prescription),
    path('api/pharmacy/stock-in/', views.stock_in),
    path('api/pharmacy/stock-out/', views.stock_out),
    path('api/pharmacy/my-prescriptions/', views.my_prescriptions, name='my_prescriptions'),
    path('api/pharmacy/request-refill/', views.request_refill, name='request_refill'),
]