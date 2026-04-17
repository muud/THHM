from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from apps.core.permissions import IsReceptionist, IsSystemAdmin, IsStaffUser
from rest_framework.response import Response
from .models import Invoice

class IsHeadAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

@api_view(['POST'])
@permission_classes([IsReceptionist])
def process_payment(request, invoice_id):
    if request.user.role not in ['admin', 'manager', 'receptionist', 'cashier']:
        return Response({'error': 'Permission denied'}, status=403)
    invoice = get_object_or_404(Invoice, id=invoice_id)
    if invoice.is_paid:
        return Response({'error': 'Already paid'}, status=400)
    
    invoice.is_paid = True
    invoice.paid_by = request.user
    invoice.paid_at = timezone.now()
    invoice.paid_amount = invoice.total_amount
    invoice.save()
    
    # Logic to advance Visit status if linked
    if invoice.visit:
        if invoice.visit.status == 'registered':
            invoice.visit.status = 'waiting_nurse'
            invoice.visit.save()
    
    return Response({'status': 'paid', 'invoice_id': invoice.id})

@api_view(['GET'])
@permission_classes([IsStaffUser])
def list_all_invoices_api(request):
    """
    Admin/Receptionist view of all invoices.
    """
    invoices = Invoice.objects.all().order_by('-created_at')
    data = []
    for inv in invoices:
        data.append({
            'id': inv.id,
            'patient_name': inv.patient.user.get_full_name() or inv.patient.user.username,
            'total_amount': str(inv.total_amount),
            'paid_amount': str(inv.paid_amount),
            'balance_due': str(inv.balance_due()),
            'is_paid': inv.is_paid,
            'created_at': inv.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return Response(data)

@api_view(['GET'])
def my_invoices(request):
    """
    Returns invoices for the current patient.
    """
    try:
        patient = request.user.patient
        invoices = Invoice.objects.filter(patient=patient).order_by('-created_at')
        data = []
        for inv in invoices:
            data.append({
                'id': inv.id,
                'total_amount': str(inv.total_amount),
                'paid_amount': str(inv.paid_amount),
                'balance_due': str(inv.balance_due()),
                'is_paid': inv.is_paid,
                'created_at': inv.created_at.strftime("%Y-%m-%d %H:%M")
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
