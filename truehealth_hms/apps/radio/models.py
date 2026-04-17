from django.db import models
from apps.core.models import BaseModel


class XRayOrder(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('performed', 'Performed'),
        ('reported', 'Reported'),
        ('cancelled', 'Cancelled'),
    )
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='xray_orders')
    visit = models.ForeignKey('appointments.Visit', on_delete=models.CASCADE, null=True, blank=True)
    body_part = models.CharField(max_length=100)
    clinical_history = models.TextField(blank=True)
    requested_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='requested_xrays')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    performed_date = models.DateTimeField(null=True, blank=True)
    performed_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='performed_xrays')

    def __str__(self):
        return f"X-Ray Order for {self.patient} - {self.body_part}"


class XRayImage(models.Model):
    order = models.ForeignKey(XRayOrder, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='xrays/%Y/%m/%d/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Image for {self.order}"


class XRayReport(BaseModel):
    order = models.OneToOneField(XRayOrder, on_delete=models.CASCADE, related_name='report')
    findings = models.TextField()
    impression = models.TextField()
    ai_findings = models.TextField(blank=True, null=True)
    ai_impression = models.TextField(blank=True, null=True)
    patient_explanation = models.TextField(blank=True, null=True)
    is_ai_generated = models.BooleanField(default=False)
    reported_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='xray_reports')
    reported_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='approved_xray_reports')

    def __str__(self):
        return f"Report for {self.order}"
