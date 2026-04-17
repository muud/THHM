from django.db import models
from apps.core.models import BaseModel

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Drug(BaseModel):
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    strength = models.CharField(max_length=50)  # e.g., "500mg"
    form = models.CharField(max_length=50)      # Tablet, Syrup, Injection
    manufacturer = models.CharField(max_length=200)
    reorder_level = models.IntegerField(default=10)
    requires_prescription = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.strength})"


class DrugBatch(BaseModel):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50, unique=True)
    expiry_date = models.DateField()
    quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.drug.name} - {self.batch_number}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.drug.reorder_level

    @property
    def is_near_expiry(self):
        from datetime import date, timedelta
        return self.expiry_date <= date.today() + timedelta(days=30)


class Prescription(BaseModel):
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    doctor = models.ForeignKey('core.User', on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    visit = models.ForeignKey('appointments.Visit', on_delete=models.CASCADE, null=True, blank=True)
    date_prescribed = models.DateTimeField(auto_now_add=True)
    is_dispensed = models.BooleanField(default=False)
    refill_requested = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Prescription for {self.patient} by {self.doctor}"


class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    drug_batch = models.ForeignKey(DrugBatch, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    dosage = models.CharField(max_length=100)   # e.g., "1 tablet twice daily"
    duration = models.CharField(max_length=50)  # e.g., "5 days"
    instructions = models.TextField(blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.drug_batch.drug.name}"


class Dispensing(BaseModel):
    prescription = models.OneToOneField(Prescription, on_delete=models.CASCADE)
    dispensed_by = models.ForeignKey('core.User', on_delete=models.CASCADE, limit_choices_to={'role': 'pharmacist'})
    dispensed_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Dispensed {self.prescription} on {self.dispensed_date}"


class StockMovement(BaseModel):
    MOVEMENT_TYPES = (
        ('IN', 'Purchase'),
        ('OUT', 'Dispensing')
    )
    drug_batch = models.ForeignKey(DrugBatch, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=100)  # e.g., invoice or prescription ID
    performed_by = models.ForeignKey('core.User', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.movement_type} - {self.drug_batch.drug.name} ({self.quantity})"

class RefillRequest(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    )
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='refill_requests')
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='refill_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refill Request for {self.prescription} ({self.status})"
