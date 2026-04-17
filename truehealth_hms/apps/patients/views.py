from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.core.permissions import IsDoctor, IsNurse, IsStaffUser, IsSystemAdmin
from rest_framework.response import Response
from apps.core.models import User
from .models import Patient, VitalReading, DiagnosisRecord
import json
import threading
from apps.radio.ai_service import suggest_medication_diagnosis

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_patient_api(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        phone = data.get('phone', '')
        dob = data.get('date_of_birth')
        gender = data.get('gender')
        
        if User.objects.filter(username=email).exists():
            return Response({'success': False, 'error': 'User with this email already exists'}, status=400)
            
        # 1. Create User
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='patient',
            phone=phone
        )
        
        # 2. Create Patient Profile
        patient = Patient.objects.create(
            user=user,
            date_of_birth=dob,
            gender=gender,
            emergency_contact_name='Self', # Default for now
            emergency_contact_phone=phone
        )
        
        # 3. Log user in
        login(request, user)
        
        return Response({
            'success': True,
            'userName': user.get_full_name() or user.username,
            'is_patient': True
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsNurse])
@csrf_exempt
def save_vitals_api(request):
    """
    Nurse records vitals for a patient and advances the visit status.
    """
    try:
        data = json.loads(request.body)
        patient_id = data.get('patient_id')
        visit_id = data.get('visit_id')
        
        patient = get_object_or_404(Patient, id=patient_id)
        visit = None
        if visit_id:
            from apps.appointments.models import Visit
            visit = get_object_or_404(Visit, id=visit_id)
            
        vital = VitalReading.objects.create(
            patient=patient,
            visit=visit,
            heart_rate=data.get('heart_rate'),
            bp_systolic=data.get('bp_systolic'),
            bp_diastolic=data.get('bp_diastolic'),
            temperature=data.get('temperature'),
            spo2=data.get('spo2'),
            weight=data.get('weight'),
            blood_glucose=data.get('blood_glucose'),
            notes=data.get('notes', '')
        )
        
        if visit:
            visit.status = 'with_doctor'
            visit.save()
            
        return Response({'success': True, 'id': vital.id})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_vitals_api(request):
    if not hasattr(request.user, 'patient'):
        return Response({'error': 'User is not a patient'}, status=403)
    
    vitals = VitalReading.objects.filter(patient=request.user.patient).order_by('-timestamp')
    data = []
    for v in vitals:
        data.append({
            'id': v.id,
            'heart_rate': v.heart_rate,
            'bp_systolic': v.bp_systolic,
            'bp_diastolic': v.bp_diastolic,
            'temperature': float(v.temperature) if v.temperature else None,
            'spo2': v.spo2,
            'weight': float(v.weight) if v.weight else None,
            'blood_glucose': float(v.blood_glucose) if v.blood_glucose else None,
            'timestamp': v.timestamp.isoformat(),
            'notes': v.notes
        })
    
    return Response(data)

def background_diag_task(record_id, symptoms, history):
    """
    Background worker thread for MedGemma analysis.
    """
    try:
        # Avoid circular import if any
        # Update record status
        record = DiagnosisRecord.objects.get(id=record_id)
        record.status = 'processing'
        record.save()
        
        # Call AI
        result = suggest_medication_diagnosis(symptoms, history)
        
        if "error" in result:
            record.status = 'failed'
            record.error_message = result['error']
        else:
            record.diagnosis_name = result.get('diagnosis', 'Inconclusive')
            record.icd10_code = result.get('icd10', '')
            record.description = result.get('rationale', '')
            record.medication_suggested = result.get('medication', '')
            try:
                record.confidence_score = float(result.get('confidence', 0)) / 100
            except:
                record.confidence_score = 0
            record.status = 'completed'
            
        record.save()
    except Exception as e:
        record = DiagnosisRecord.objects.filter(id=record_id).first()
        if record:
            record.status = 'failed'
            record.error_message = str(e)
            record.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def diagnosis_suggest_api(request):
    """
    Starts an asynchronous MedGemma diagnostic task.
    """
    try:
        data = json.loads(request.body)
        symptoms = data.get('symptoms')
        history = data.get('history', '')
        
        if not symptoms:
            return Response({'error': 'Symptoms are required'}, status=400)
            
        # 1. Create a pending record
        record = DiagnosisRecord.objects.create(
            patient=request.user.patient,
            diagnosis_name="Analyzing symptoms...",
            description="MedGemma is analyzing the presentation background...",
            is_ai_generated=True,
            status='pending',
            created_by=request.user
        )
        
        # 2. Launch background thread
        thread = threading.Thread(target=background_diag_task, args=(record.id, symptoms, history))
        thread.start()
        
        return Response({'success': True, 'id': record.id, 'status': 'pending'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diagnosis_status_api(request, pk):
    """
    Polls the status of a diagnostic record.
    """
    record = get_object_or_404(DiagnosisRecord, pk=pk)
    return Response({
        'id': record.id,
        'status': record.status,
        'diagnosis': {
            'diagnosis_name': record.diagnosis_name,
            'icd10_code': record.icd10_code,
            'description': record.description,
            'medication_suggested': record.medication_suggested,
            'confidence_score': record.confidence_score,
            'error': record.error_message
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_diagnoses_api(request):
    """
    Returns the list of diagnoses for the current patient.
    """
    if not hasattr(request.user, 'patient'):
        return Response({'error': 'User is not a patient'}, status=403)
    
    diagnoses = DiagnosisRecord.objects.filter(patient=request.user.patient).order_by('-created_at')
    data = []
    for d in diagnoses:
        data.append({
            'id': d.id,
            'diagnosis_name': d.diagnosis_name,
            'icd10_code': d.icd10_code,
            'description': d.description,
            'clinical_notes': d.clinical_notes,
            'medication_suggested': d.medication_suggested,
            'confidence_score': d.confidence_score,
            'is_ai_generated': d.is_ai_generated,
            'status': d.status,
            'created_at': d.created_at.isoformat()
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsDoctor])
@csrf_exempt
def save_diagnosis_api(request):
    """
    Saves a diagnosis record manually.
    """
    try:
        data = json.loads(request.body)
        patient_id = data.get('patient_id')
        
        if patient_id:
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = request.user.patient
            
        diagnosis = DiagnosisRecord.objects.create(
            patient=patient,
            diagnosis_name=data.get('diagnosis_name'),
            icd10_code=data.get('icd10_code', ''),
            description=data.get('description', ''),
            clinical_notes=data.get('clinical_notes', ''),
            medication_suggested=data.get('medication_suggested', ''),
            confidence_score=data.get('confidence_score', 1.0),
            is_ai_generated=data.get('is_ai_generated', False),
            status='completed',
            created_by=request.user
        )
        
        return Response({'success': True, 'id': diagnosis.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsStaffUser])
def patient_full_history_api(request, pk):
    """
    Consolidates the entire medical history for a patient.
    """
    patient = get_object_or_404(Patient, pk=pk)
    
    from apps.beds.models import Admission
    admissions = Admission.objects.filter(patient=patient).order_by('-admission_date')
    adm_data = [{
        'id': a.id, 
        'date': a.admission_date.isoformat(), 
        'status': 'Discharged' if a.is_discharged else 'Active',
        'ward': a.bed.ward.name if a.bed else 'N/A', 
        'diagnosis': a.diagnosis
    } for a in admissions]

    diagnoses = DiagnosisRecord.objects.filter(patient=patient).order_by('-created_at')
    diag_data = [{
        'id': d.id, 
        'name': d.diagnosis_name, 
        'icd10': d.icd10_code, 
        'medication': d.medication_suggested,
        'is_ai': d.is_ai_generated, 
        'status': d.status,
        'date': d.created_at.isoformat()
    } for d in diagnoses]

    from apps.lab.models import LabResult
    labs = LabResult.objects.filter(patient=patient).order_by('-created_at')
    lab_data = [{
        'id': l.id, 
        'test_name': l.order.test_type.name, 
        'value': l.result_value, 
        'status': l.status, 
        'date': l.created_at.isoformat()
    } for l in labs]

    from apps.radio.models import XRayOrder
    xrays = XRayOrder.objects.filter(patient=patient).order_by('-created_at')
    xray_data = [{
        'id': x.id, 
        'body_part': x.body_part, 
        'status': x.status, 
        'report': x.report.impression if hasattr(x, 'report') else None, 
        'date': x.created_at.isoformat()
    } for x in xrays]

    vitals = VitalReading.objects.filter(patient=patient).order_by('-timestamp')[:10]
    vitals_data = [{
        'id': v.id, 
        'heart_rate': v.heart_rate, 
        'bp': f"{v.bp_systolic}/{v.bp_diastolic}", 
        'date': v.timestamp.isoformat()
    } for v in vitals]

    return Response({
        'patient': {
            'name': patient.user.get_full_name() or patient.user.username,
            'mrn': patient.mrn,
            'gender': patient.gender,
            'dob': patient.date_of_birth
        },
        'history': {
            'admissions': adm_data,
            'diagnoses': diag_data,
            'labs': lab_data,
            'radiology': xray_data,
            'vitals': vitals_data
        }
    })

@api_view(['GET'])
@permission_classes([IsStaffUser])
def patient_list_api(request):
    """
    Returns a simple list of all patients for selection.
    """
    patients = Patient.objects.all().order_by('user__last_name')
    data = [{
        'id': p.id,
        'name': p.user.get_full_name() or p.user.username,
        'mrn': p.mrn
    } for p in patients]
    return Response(data)