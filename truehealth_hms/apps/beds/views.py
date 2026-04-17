from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .models import Admission, Bed, Ward
from apps.patients.models import Patient
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_admissions_api(request):
    """
    Returns all active admissions for administrative review.
    """
    admissions = Admission.objects.filter(is_discharged=False).order_by('-admission_date')
    data = []
    for adm in admissions:
        data.append({
            'id': adm.id,
            'patient_name': adm.patient.user.get_full_name() or adm.patient.user.username,
            'mrn': adm.patient.mrn,
            'ward': adm.bed.ward.name if adm.bed else "Triage",
            'bed_number': adm.bed.bed_number if adm.bed else "N/A",
            'admission_date': adm.admission_date.isoformat(),
            'diagnosis': adm.diagnosis
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def admit_patient_api(request):
    """
    Admits a patient into a bed.
    """
    try:
        data = json.loads(request.body)
        patient = get_object_or_404(Patient, id=data.get('patient_id'))
        bed = get_object_or_404(Bed, id=data.get('bed_id'))
        
        if bed.is_occupied:
            return Response({'error': 'Bed is already occupied'}, status=400)
            
        admission = Admission.objects.create(
            patient=patient,
            bed=bed,
            admitting_doctor=request.user,
            diagnosis=data.get('diagnosis', ''),
            notes=data.get('notes', '')
        )
        
        return Response({'success': True, 'id': admission.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def discharge_patient_api(request, pk):
    """
    Discharges an admitted patient.
    """
    try:
        admission = get_object_or_404(Admission, pk=pk)
        admission.is_discharged = True
        admission.actual_discharge_date = timezone.now()
        admission.save()
        
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_beds_api(request):
    """
    Returns list of available beds grouped by ward.
    """
    wards = Ward.objects.all()
    data = []
    for ward in wards:
        beds = ward.beds.filter(is_occupied=False, is_active=True)
        if beds.exists():
            data.append({
                'ward': ward.name,
                'ward_id': ward.id,
                'available_count': beds.count(),
                'beds': [{'id': b.id, 'number': b.bed_number, 'type': b.bed_type} for b in beds]
            })
    return Response(data)
