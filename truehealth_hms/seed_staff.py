from apps.core.models import Department, InternalHospital, User
from apps.management.models import Staff

h = InternalHospital.objects.first() or InternalHospital.objects.create(name='True Health HMS', code='THH-001')

depts = {
    'DOC': 'Medical',
    'NUR': 'Nursing',
    'PHA': 'Pharmacy',
    'LAB': 'Laboratory',
    'XRY': 'Radiology',
    'MAT': 'Maternity',
    'SEC': 'Security',
    'EYE': 'Eye Clinic',
    'REC': 'Receptionist'
}

for code, name in depts.items():
    Department.objects.get_or_create(hospital=h, code=code, defaults={'name': name})

dr_smith = User.objects.filter(username='dr_smith').first()
if dr_smith:
    Staff.objects.get_or_create(user=dr_smith, defaults={
        'department': Department.objects.get(code='DOC'),
        'position': 'Senior Physician'
    })

dr_jones = User.objects.filter(username='dr_jones').first()
if dr_jones:
    Staff.objects.get_or_create(user=dr_jones, defaults={
        'department': Department.objects.get(code='DOC'),
        'position': 'Consultant'
    })

print("Seed completed.")
