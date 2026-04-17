from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_created')

    class Meta:
        abstract = True

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('lab_tech', 'Lab Technician'),
        ('pharmacist', 'Pharmacist'),
        ('radiologist', 'Radiologist'),
        ('receptionist', 'Receptionist'),
        ('cashier', 'Cashier'),
        ('manager', 'Manager'),
        ('patient', 'Patient'),
        ('support_staff', 'Support Staff'),
        ('er_developer', 'ER Developer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    phone = models.CharField(max_length=15, blank=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        # Prevent self-demotion or role tampering for critical developers
        if self.pk:
            orig = User.objects.get(pk=self.pk)
            if (orig.role == 'er_developer' or orig.username == 'mohaabi') and self.role != orig.role:
                raise ValueError("Critical Security Error: Cannot change role of the ER Developer.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.role == 'er_developer' or self.username == 'mohaabi':
            raise ValueError("Critical Security Error: The ER Developer account is immutable and cannot be deleted.")
        super().delete(*args, **kwargs)


class InternalHospital(BaseModel):
    name = models.CharField(max_length=255, default='True Health HMS Central')
    code = models.CharField(max_length=20, unique=True, default='THH-001')
    address = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class Department(BaseModel):
    hospital = models.ForeignKey(InternalHospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.hospital.name})"