from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.patients.models import Patient

class Visit(BaseModel):
    STATUS_CHOICES = (
        ('registered', 'Registered'),
        ('paid', 'Paid'),
        ('waiting_nurse', 'Waiting for Nurse'),
        ('with_doctor', 'With Doctor'),
        ('lab_required', 'Lab Required'),
        ('lab_done', 'Lab Results Done'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey('core.User', on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'}, null=True, blank=True)
    date = models.DateField(default=timezone.now)
    time = models.TimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    symptoms = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Visit by {self.patient} on {self.date} ({self.status})"