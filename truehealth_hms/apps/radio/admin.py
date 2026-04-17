from django.contrib import admin
from .models import XRayOrder, XRayImage, XRayReport

@admin.register(XRayOrder)
class XRayOrderAdmin(admin.ModelAdmin):
    list_display = ('patient', 'body_part', 'status', 'requested_by', 'performed_date')
    list_filter = ('status', 'body_part')
    search_fields = ('patient__mrn', 'patient__user__username')

@admin.register(XRayImage)
class XRayImageAdmin(admin.ModelAdmin):
    list_display = ('order', 'uploaded_at')

@admin.register(XRayReport)
class XRayReportAdmin(admin.ModelAdmin):
    list_display = ('order', 'reported_by', 'reported_date', 'is_approved')
