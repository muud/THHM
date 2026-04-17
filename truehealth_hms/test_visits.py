from apps.appointments.models import Visit
from apps.patients.models import Patient
from apps.core.models import User

# Check if Visit table exists and can be queried
visits_count = Visit.objects.count()
print(f"✓ Visit model is working. Current visits in DB: {visits_count}")

# Verify Visit has proper fields
print("✓ Visit model fields:")
for field in Visit._meta.get_fields():
    print(f"  - {field.name}")
