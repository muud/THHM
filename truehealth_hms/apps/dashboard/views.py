from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.beds.models import Admission, Bed
from apps.patients.models import DiagnosisRecord
from apps.billing.models import Invoice

def index(request):
    """
    Renders the Smart Health Dashboard.
    """
    return render(request, 'dashboard/premium_dashboard.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_metrics_api(request):
    """
    Provides administrative metrics for hospital management performance.
    """
    # 1. Admission Stats
    active_admissions = Admission.objects.filter(is_discharged=False).count()
    total_beds = Bed.objects.filter(is_active=True).count()
    occupancy_rate = (active_admissions / total_beds * 100) if total_beds > 0 else 0
    
    # 2. Diagnosis Accuracy & Usage (MedGemma)
    ai_diagnoses = DiagnosisRecord.objects.filter(is_ai_generated=True).count()
    manual_diagnoses = DiagnosisRecord.objects.filter(is_ai_generated=False).count()
    avg_confidence = DiagnosisRecord.objects.filter(is_ai_generated=True).aggregate(Avg=Sum('confidence_score')/Count('id'))['Avg'] or 0
    
    # 3. Revenue Outlook
    total_receivable = Invoice.objects.filter(is_paid=False).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_paid = Invoice.objects.filter(is_paid=True).aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
    
    return Response({
        'occupancy': {
            'active_admissions': active_admissions,
            'total_beds': total_beds,
            'occupancy_rate': round(occupancy_rate, 1)
        },
        'diagnostics': {
            'ai_assisted': ai_diagnoses,
            'manual_entry': manual_diagnoses,
            'medgemma_avg_confidence': round(avg_confidence * 100, 1) if avg_confidence else 0
        },
        'financials': {
            'pending_receivables': float(total_receivable),
            'total_collected': float(total_paid)
        }
    })
