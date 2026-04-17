from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel, User, Department
from apps.billing.models import Invoice

class Staff(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=20, unique=True, editable=False)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='staff_members')
    position = models.CharField(max_length=100)
    bank_account = models.CharField(max_length=50, blank=True)
    salary_grade = models.CharField(max_length=10)
    hire_date = models.DateField(auto_now_add=True)
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=False) # Shift status


    def save(self, *args, **kwargs):
        if not self.employee_id:
            import random
            import string
            from django.utils import timezone
            dept_code = self.department.code if self.department else 'STAFF'
            current_year = timezone.now().year
            random_digits = ''.join(random.choices(string.digits, k=4))
            self.employee_id = f"{dept_code}-{current_year}-{random_digits}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.employee_id})"

class Attendance(BaseModel):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='attendance_logs')
    clock_in = models.DateTimeField(auto_now_add=True)
    clock_out = models.DateTimeField(null=True, blank=True)

    @property
    def duration(self):
        if self.clock_out:
            return self.clock_out - self.clock_in
        return None

    def __str__(self):
        return f"{self.staff.employee_id} ({self.clock_in.date()})"


class Payroll(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'), ('approved', 'Approved'),
        ('paid', 'Paid'), ('rejected', 'Rejected')
    ]
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='payrolls')
    month = models.DateField()  # first day of month
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_payrolls')
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        self.net_pay = self.base_salary + (self.overtime_hours * self.overtime_rate) + self.bonus - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.staff} – {self.month.strftime('%b %Y')}"

class Expense(BaseModel):
    category = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    receipt = models.FileField(upload_to='expenses/', blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.category} – {self.amount}"
