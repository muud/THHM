import os
import django
from django.contrib.auth import get_user_model

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def create_superuser():
    User = get_user_model()
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin_password_123')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@truehealth.com')

    user = User.objects.filter(username=username).first()
    if not user:
        print(f"Creating superuser: {username}...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created successfully.")
    else:
        print(f"Updating existing superuser '{username}' password...")
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print("Password updated successfully.")

if __name__ == '__main__':
    create_superuser()
