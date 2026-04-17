from django.db import models
from apps.core.models import BaseModel

class Patient(BaseModel):
    MRN_PREFIX = 'PT'

    mrn = models.CharField(max_length=20, unique=True, editable=False)
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='patient')
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')])
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    nhif_number = models.CharField(max_length=20, blank=True)
    insurance_policy = models.CharField(max_length=50, blank=True)
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=15)
    patient_type = models.CharField(max_length=20, choices=[
        ('outpatient', 'Outpatient'),
        ('inpatient', 'Inpatient'),
        ('emergency', 'Emergency'),
    ], default='outpatient')
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.mrn:
            # Simple sequential MRN (you can customise)
            import time
            self.mrn = f"{self.MRN_PREFIX}{int(time.time())}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.mrn} - {self.user.get_full_name() or self.user.username}"


class VitalReading(BaseModel):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    visit = models.ForeignKey('appointments.Visit', on_delete=models.SET_NULL, null=True, blank=True, related_name='vitals')
    heart_rate = models.IntegerField(null=True, blank=True)
    bp_systolic = models.IntegerField(null=True, blank=True)
    bp_diastolic = models.IntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    spo2 = models.IntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    blood_glucose = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Vitals for {self.patient} at {self.timestamp}"


class DiagnosisRecord(BaseModel):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diagnoses')
    diagnosis_name = models.CharField(max_length=200)
    icd10_code = models.CharField(max_length=20, blank=True)
    description = models.TextField()
    clinical_notes = models.TextField(blank=True)
    medication_suggested = models.TextField(blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    is_ai_generated = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='completed', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    error_message = models.TextField(blank=True)
    created_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='recorded_diagnoses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.diagnosis_name} for {self.patient} ({self.created_at.date()})"