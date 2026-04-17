from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsDoctor, IsNurse, IsReceptionist, IsLabTech, IsStaffUser, IsSystemAdmin
from rest_framework.response import Response
from django.utils import timezone
from .models import Visit
from apps.core.models import User

def dashboard(request):
    """
    Renders the dedicated appointments dashboard.
    """
    return render(request, 'appointments/dashboard.html')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def available_slots(request):
    specialty = request.data.get('specialty')
    # For simplicity, get all active doctors. You can filter by specialty later.
    doctors = User.objects.filter(role='doctor', is_active=True)[:3]
    slots = []
    for doc in doctors:
        slots.append({
            'doctor': doc.get_full_name(),
            'doctor_id': doc.id,
            'datetime': (timezone.now() + timezone.timedelta(days=2)).isoformat()
        })
    return Response(slots)

from apps.patients.models import Patient

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    doctor_id = request.data.get('doctor_id')
    dt_str = request.data.get('datetime')
    patient = request.user.patient
    # Parse datetime (simplified)
    date_part = dt_str[:10]
    time_part = dt_str[11:16]
    Visit.objects.create(
        patient=patient,
        doctor_id=doctor_id,
        date=date_part,
        time=time_part,
        status='registered'
    )
    return Response({'status': 'ok'})

@api_view(['POST'])
@permission_classes([IsReceptionist])
def check_in_api(request):
    """
    Receptionist checks in a patient (creates a visit with status 'registered').
    """
    patient_id = request.data.get('patient_id')
    doctor_id = request.data.get('doctor_id')
    patient = get_object_or_404(Patient, id=patient_id)
    
    visit = Visit.objects.create(
        patient=patient,
        doctor_id=doctor_id,
        date=timezone.now().date(),
        time=timezone.now().time(),
        status='registered'
    )
    
    # Create initial consultation invoice
    from apps.billing.models import Invoice, InvoiceItem
    invoice = Invoice.objects.create(patient=patient, visit=visit, total_amount=1000) # Fixed fee for now
    InvoiceItem.objects.create(invoice=invoice, description="Consultation Fee", quantity=1, unit_price=1000, total=1000)
    
    return Response({'success': True, 'visit_id': visit.id, 'invoice_id': invoice.id})

@api_view(['GET'])
@permission_classes([IsStaffUser])
def queue_list_api(request):
    """
    Returns a list of visits filtered by status for staff dashboards.
    """
    role = request.user.role
    status_filter = request.GET.get('status')
    
    visits = Visit.objects.all().order_by('created_at')
    
    if status_filter:
        visits = visits.filter(status=status_filter)
    
    data = []
    for v in visits:
        data.append({
            'id': v.id,
            'patient_name': v.patient.user.get_full_name() or v.patient.user.username,
            'patient_id': v.patient.id,
            'mrn': v.patient.mrn,
            'status': v.status,
            'status_display': v.get_status_display(),
            'doctor_name': v.doctor.get_full_name() if v.doctor else 'N/A',
            'time': v.time.strftime('%H:%M')
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsStaffUser])
def update_visit_status_api(request, pk):
    visit = get_object_or_404(Visit, pk=pk)
    new_status = request.data.get('status')
    if new_status:
        visit.status = new_status
        visit.save()
        return Response({'success': True})
    return Response({'error': 'No status provided'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    patient = request.user.patient
    visits = Visit.objects.filter(patient=patient).order_by('-date')
    data = [{
        'date': v.date.isoformat(),
        'time': v.time.strftime('%H:%M'),
        'doctor': v.doctor.get_full_name() if v.doctor else 'N/A',
        'status': v.get_status_display()
    } for v in visits]
    return Response(data)
