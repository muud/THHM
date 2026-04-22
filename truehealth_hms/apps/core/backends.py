from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend to allow login with either username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
            
        try:
            # Try to fetch user by username or email
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # Handle cases where multiple users might share an email (if not unique)
            return User.objects.filter(email__iexact=username).order_by('id').first()
        return None
