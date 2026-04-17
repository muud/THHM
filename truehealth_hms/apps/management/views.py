from django.views.generic import TemplateView
from django.db.models import Sum, Count
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Staff, Payroll, Expense, Attendance
from apps.core.models import User, Department
import json

class ManagementDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'management/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Workforce Metrics
        context['total_staff'] = Staff.objects.count()
        context['dept_stats'] = list(Staff.objects.values('department').annotate(count=Count('id')))
        
        # Financial Metrics
        context['pending_payroll'] = Payroll.objects.filter(status='pending').aggregate(Sum('net_pay'))['net_pay__sum'] or 0
        context['pending_expenses'] = Expense.objects.filter(approved=False).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Recent activity
        context['recent_expenses'] = Expense.objects.order_by('-date')[:5]
        context['recent_staff'] = Staff.objects.order_by('-hire_date')[:5]
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_list_api(request):
    staff_members = Staff.objects.all().select_related('user', 'department')
    data = []
    for s in staff_members:
        data.append({
            'id': s.id,
            'employee_id': s.employee_id,
            'name': s.user.get_full_name() or s.user.username,
            'role': s.user.get_role_display(),
            'department': s.department.name if s.department else 'N/A',
            'is_active': s.is_active,
            'hire_date': s.hire_date.isoformat() if s.hire_date else None
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_toggle_api(request):
    """
    Clock in or clock out for the currently logged in user.
    """
    staff = getattr(request.user, 'staff_profile', None)
    if not staff:
        return Response({'error': 'User does not have a staff profile'}, status=403)
    
    if staff.is_active:
        # Clock out
        active_log = Attendance.objects.filter(staff=staff, clock_out__isnull=True).last()
        if active_log:
            active_log.clock_out = timezone.now()
            active_log.save()
        staff.is_active = False
        staff.save()
        return Response({'status': 'clocked_out', 'is_active': False})
    else:
        # Clock in
        Attendance.objects.create(staff=staff)
        staff.is_active = True
        staff.save()
        return Response({'status': 'clocked_in', 'is_active': True})
