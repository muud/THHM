from django.db import models
from apps.core.models import BaseModel

class TestCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Test categories"

class Test(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(TestCategory, on_delete=models.SET_NULL, null=True, blank=True)
    code = models.CharField(max_length=20, unique=True)
    normal_range = models.CharField(max_length=100, blank=True)  # e.g., "4.5-11.0"
    unit = models.CharField(max_length=20, blank=True)           # e.g., "g/dL"
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} ({self.code})"

class TestRequest(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('collected', 'Sample Collected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    visit = models.ForeignKey('appointments.Visit', on_delete=models.CASCADE, null=True, blank=True)
    requested_by = models.ForeignKey('core.User', on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    requested_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request for {self.patient} - {self.status}"

class TestRequestItem(models.Model):
    test_request = models.ForeignKey(TestRequest, on_delete=models.CASCADE, related_name='items')
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    result_value = models.CharField(max_length=100, blank=True)
    result_notes = models.TextField(blank=True)
    is_abnormal = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.test.name} for {self.test_request.patient}"

class Sample(models.Model):
    test_request = models.OneToOneField(TestRequest, on_delete=models.CASCADE, related_name='sample')
    collected_by = models.ForeignKey('core.User', on_delete=models.CASCADE, limit_choices_to={'role': 'lab_tech'})
    collected_date = models.DateTimeField(auto_now_add=True)
    sample_type = models.CharField(max_length=50)  # e.g., Blood, Urine, etc.
    container = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Sample for {self.test_request}"
