from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """Allows access only to hospital staff (doctors, nurses, admins, etc)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role != 'patient')

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'doctor')

class IsNurse(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'nurse')

class IsLabTech(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'lab_tech')

class IsReceptionist(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['receptionist', 'cashier'])

class IsSystemAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager', 'er_developer'])

class IsERDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'er_developer')
