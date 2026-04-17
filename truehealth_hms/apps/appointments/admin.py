from django.contrib import admin
from .models import Visit

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__mrn', 'patient__user__username', 'doctor__username')
