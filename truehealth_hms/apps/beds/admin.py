from django.contrib import admin
from .models import Ward, Bed, Admission

@admin.register(Ward)
class WardAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'floor', 'department', 'nurse_in_charge')
    search_fields = ('name', 'code')

@admin.register(Bed)
class BedAdmin(admin.ModelAdmin):
    list_display = ('bed_number', 'ward', 'bed_type', 'is_occupied')
    list_filter = ('ward', 'bed_type', 'is_occupied')
    search_fields = ('bed_number',)

@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'bed', 'admission_date', 'expected_discharge_date', 'is_discharged')
    list_filter = ('is_discharged', 'admission_date')
    search_fields = ('patient__mrn', 'patient__user__username')
