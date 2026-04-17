from django.db import models
from apps.core.models import BaseModel, User
from apps.patients.models import Patient

class Ward(BaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    floor = models.IntegerField()
    department = models.CharField(max_length=100)  # e.g., "General Medicine", "Surgery", "Maternity"
    nurse_in_charge = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'nurse'})

    def __str__(self):
        return f"{self.name} ({self.code})"

class Bed(BaseModel):
    BED_TYPES = (
        ('general', 'General'),
        ('icu', 'ICU'),
        ('private', 'Private'),
        ('isolation', 'Isolation'),
    )
    bed_number = models.CharField(max_length=10)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_type = models.CharField(max_length=20, choices=BED_TYPES, default='general')
    is_occupied = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('ward', 'bed_number')

    def __str__(self):
        return f"{self.ward.name} - Bed {self.bed_number}"

class Admission(BaseModel):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='admissions')
    bed = models.ForeignKey(Bed, on_delete=models.SET_NULL, null=True, related_name='admissions')
    admission_date = models.DateTimeField(auto_now_add=True)
    expected_discharge_date = models.DateField(null=True, blank=True)
    actual_discharge_date = models.DateTimeField(null=True, blank=True)
    admitting_doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    diagnosis = models.TextField(blank=True)
    is_discharged = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self.bed and not self.is_discharged:
            self.bed.is_occupied = True
            self.bed.save()
        elif self.is_discharged and self.bed:
            self.bed.is_occupied = False
            self.bed.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient} admitted on {self.admission_date}"
