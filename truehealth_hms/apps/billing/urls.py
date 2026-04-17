from django.urls import path
from . import views

app_name = 'billing'

urlpatterns = [
    path('api/process-payment/<int:invoice_id>/', views.process_payment, name='process_payment'),
    path('api/my-invoices/', views.my_invoices, name='my_invoices'),
]
