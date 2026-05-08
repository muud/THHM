import logging
import json
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from apps.radio.ai_service import general_health_assistant
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.db.models import Sum
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from apps.appointments.models import Visit
from apps.lab.models import TestRequest
from apps.pharmacy.models import Prescription
from apps.billing.models import Invoice

logger = logging.getLogger(__name__)

@login_required
def role_redirect(request):
    """
    Central redirection view to branch users to their appropriate dashboard
    immediately after successful login.
    """
    user = request.user
    
    # 1. Check if the user is a Patient (detected via OneToOne profile)
    if hasattr(user, 'patient'):
        return redirect('dashboard:index')
    
    # 2. Branch based on specific roles defined in core.User
    role = user.role
    
    if role in ['doctor', 'nurse']:
        return redirect('appointments:dashboard')
    
    elif role == 'pharmacist':
        return redirect('pharmacy:staff_dashboard')
    
    elif role == 'lab_tech':
        return redirect('lab:dashboard')
    
    elif role == 'radiologist':
        return redirect('radio:dashboard')
    
    elif role in ['receptionist', 'cashier']:
        return redirect('staff:dashboard')
    
    elif role == 'manager':
        return redirect('management:dashboard')
    
    elif role == 'admin':
        # Now point to the premium Management Control Center
        return redirect('management:dashboard')
        
    # Default fallback for users with no specific mapping
    return redirect('dashboard:index')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_overview_api(request):
    """
    Returns aggregated stats for the patient dashboard.
    """
    if not hasattr(request.user, 'patient'):
        return Response({'error': 'User is not a patient'}, status=403)
        
    patient = request.user.patient
    
    # Stats
    upcoming_appointments = Visit.objects.filter(patient=patient, status='confirmed').count()
    pending_labs = TestRequest.objects.filter(patient=patient, status__in=['pending', 'collected', 'in_progress']).count()
    active_prescriptions = Prescription.objects.filter(patient=patient, is_dispensed=False).count()
    
    # Billing
    billing_summary = Invoice.objects.filter(patient=patient, is_paid=False).aggregate(total=Sum('total_amount'), paid=Sum('paid_amount'))
    total_due = (billing_summary['total'] or 0) - (billing_summary['paid'] or 0)
    
    return Response({
        'userName': request.user.get_full_name() or request.user.username,
        'stats': {
            'appointments': upcoming_appointments,
            'labs': pending_labs,
            'prescriptions': active_prescriptions,
            'billing_due': float(total_due),
            'insurance_cover': 45000.0, # Placeholder for now as it's not in models yet
            'insurance_expiry': 'Dec 2026'
        }
    })
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_api(request):
    try:
        data = json.loads(request.body)
        username = data.get('username') or data.get('email')
        password = data.get('password')
        
        logger.info(f"Login attempt for username: {username}")
        
        user = authenticate(username=username, password=password)
        if user is not None:
            logger.info(f"Authentication successful for {username}")
            login(request, user)
            has_patient = hasattr(user, 'patient')
            return Response({
                'success': True,
                'userName': user.get_full_name() or user.username,
                'role': user.role,
                'is_patient': has_patient
            })
        else:
            logger.info(f"Authentication failed for {username}")
            return Response({'success': False, 'error': 'Invalid credentials'}, status=401)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def patient_ai_assistant_api(request):
    try:
        data = json.loads(request.body)
        query = data.get('query')
        if not query:
            return Response({'error': 'Query is required'}, status=400)
            
        user_context = f"User: {request.user.username}, Role: {request.user.role}"
        result = general_health_assistant(query, user_context)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    logout(request)
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response({"detail": "CSRF cookie set"})

from apps.core.models import User
from django.contrib.auth.hashers import make_password

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_users_api(request):
    if request.user.role not in ['admin', 'manager', 'er_developer']:
        return Response({'error': 'Permission denied'}, status=403)
        
    if request.method == 'GET':
        users = User.objects.exclude(role='patient').values('id', 'username', 'email', 'role', 'is_active', 'date_joined')
        return Response(list(users))
        
    elif request.method == 'POST':
        data = request.data
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'staff')
        email = data.get('email', '')
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)
            
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            role=role,
            is_staff=role in ['admin', 'manager', 'er_developer']
        )

        # Automatically determine role and create Staff profile if not a patient
        if role != 'patient':
            from apps.management.models import Staff
            from apps.core.models import Department
            from django.contrib.auth.models import Group
            
            dept_code = data.get('department_id')
            dept = Department.objects.filter(code=dept_code).first()
            
            # Map Dept to System Role
            role_map = {
                'DOC': 'doctor', 'NUR': 'nurse', 'MAT': 'nurse', 'EYE': 'doctor',
                'PHA': 'pharmacist', 'LAB': 'lab_tech', 'XRY': 'radiologist',
                'REC': 'receptionist', 'SEC': 'support_staff', 'MNT': 'support_staff'
            }

            if dept_code in role_map:
                user.role = role_map[dept_code]
                user.is_staff = True
                user.save()
            
            Staff.objects.get_or_create(user=user, defaults={'department': dept})
            
            # Django Group synchronization
            if dept:
                group, _ = Group.objects.get_or_create(name=f"{dept.name} Group")
                user.groups.add(group)


        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_api(request, pk):
    if request.user.role not in ['admin', 'manager', 'er_developer']:
        return Response({'error': 'Permission denied'}, status=403)
        
    try:
        user = User.objects.get(pk=pk)
        
        if user.username == 'mohaabi' or user.role == 'er_developer':
            return Response({'error': 'Critical Error: Cannot delete or modify the ER Developer.'}, status=403)
            
        if user.id == request.user.id:
            return Response({'error': 'Cannot delete yourself.'}, status=400)
            
        user.delete()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])

@permission_classes([IsAuthenticated])
def get_staff_status_api(request):
    """
    Returns current staff work status (active shift).
    """
    staff = getattr(request.user, 'staff_profile', None)
    if not staff:
        return Response({'is_staff': False})
    
    return Response({
        'is_staff': True,
        'is_active': staff.is_active,
        'employee_id': staff.employee_id
    })
