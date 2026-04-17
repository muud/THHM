from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import TestRequest, TestRequestItem
from apps.patients.models import Patient
from apps.core.permissions import IsDoctor, IsLabTech, IsStaffUser
from django.shortcuts import get_object_or_404

def dashboard(request):
    """
    Renders the dedicated laboratory dashboard.
    """
    return render(request, 'lab/dashboard.html')

@api_view(['POST'])
@permission_classes([IsDoctor])
def request_lab_test(request):
    """
    Doctor requests a lab test. Links it to a Visit and updates its status.
    """
    from apps.appointments.models import Visit
    
    test_id = request.data.get('test_id') # In real use, test ID from Test model
    patient_id = request.data.get('patient_id')
    visit_id = request.data.get('visit_id')
    
    patient = request.user.patient if not patient_id else Patient.objects.get(id=patient_id)
    visit = get_object_or_404(Visit, id=visit_id) if visit_id else None
    
    test_request = TestRequest.objects.create(
        patient=patient,
        visit=visit,
        requested_by=request.user,
        status='pending'
    )
    
    if visit:
        visit.status = 'registered' # Sent back to reception for payment
        visit.save()
        
        # Create Lab Fee Invoice
        from apps.billing.models import Invoice, InvoiceItem
        invoice = Invoice.objects.create(patient=patient, visit=visit, total_amount=500) # Fixed lab fee
        InvoiceItem.objects.create(invoice=invoice, description="Laboratory Fees", quantity=1, unit_price=500, total=500)
        
    return Response({'success': True, 'request_id': test_request.id})

@api_view(['POST'])
@permission_classes([IsLabTech])
def record_results_api(request):
    """
    Lab tech records test results and advances visit status to 'lab_done'.
    """
    request_id = request.data.get('request_id')
    test_request = get_object_or_404(TestRequest, id=request_id)
    
    # Simple logic: mark as completed and update visit
    test_request.status = 'completed'
    test_request.save()
    
    if test_request.visit:
        test_request.visit.status = 'lab_done'
        test_request.visit.save()
        
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_lab_results(request):
    patient = request.user.patient
    items = TestRequestItem.objects.filter(test_request__patient=patient, result_value__isnull=False)
    data = [{
        'test_name': item.test.name,
        'value': item.result_value,
        'unit': item.test.unit,
        'interpretation': 'Abnormal' if item.is_abnormal else 'Normal'
    } for item in items]
    return Response(data)

def index(request):
    return render(request, 'placeholder.html')

def index(request):
    return render(request, 'placeholder.html')
