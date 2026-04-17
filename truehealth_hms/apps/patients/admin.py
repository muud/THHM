from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('mrn', 'user', 'date_of_birth', 'gender', 'nhif_number', 'is_active')
    search_fields = ('mrn', 'user__first_name', 'user__last_name', 'user__username')
    list_filter = ('gender', 'patient_type', 'is_active')