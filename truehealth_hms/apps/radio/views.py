from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import XRayOrder, XRayImage, XRayReport
from .serializers import XRayOrderSerializer, XRayImageSerializer, XRayReportSerializer
from .ai_service import analyze_xray
from django.db import transaction
import os
import logging

logger = logging.getLogger(__name__)

class XRayOrderViewSet(viewsets.ModelViewSet):
    queryset = XRayOrder.objects.all()
    serializer_set = XRayOrderSerializer

    def get_serializer_class(self):
        return XRayOrderSerializer

    @action(detail=False, methods=['get'])
    def my_xrays(self, request):
        if not hasattr(request.user, 'patient'):
            return Response({"error": "User is not a patient"}, status=status.HTTP_403_FORBIDDEN)
        orders = XRayOrder.objects.filter(patient=request.user.patient).order_by('-created_at')
        return Response(XRayOrderSerializer(orders, many=True).data)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        order = self.get_object()
        image = order.images.first() # Analyze the first image for now
        
        if not image:
            return Response({"error": "No image found for this order."}, status=status.HTTP_400_BAD_REQUEST)
            
        file_path = image.image.path
        
        # Call Gemini service
        logger.info(f"Starting AI analysis for order {order.id} using file {file_path}")
        analysis_result = analyze_xray(file_path, order.clinical_history)
        
        if "error" in analysis_result:
            logger.error(f"AI Analysis failed for order {order.id}: {analysis_result['error']}")
            return Response(analysis_result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Create or update report within a transaction
        try:
            with transaction.atomic():
                findings = analysis_result.get('findings') or "No specific findings reported."
                impression = analysis_result.get('impression') or "No specific impression provided."
                patient_explanation = analysis_result.get('patient_explanation') or ""
                
                report, created = XRayReport.objects.update_or_create(
                    order=order,
                    defaults={
                        'ai_findings': findings,
                        'ai_impression': impression,
                        'patient_explanation': patient_explanation,
                        'is_ai_generated': True,
                        'findings': findings, # Initial draft
                        'impression': impression # Initial draft
                    }
                )
                
                order.status = 'reported'
                order.save()
                
                logger.info(f"Successfully created/updated report for order {order.id}")
                return Response(XRayReportSerializer(report).data)
        except Exception as e:
            logger.exception(f"Database error saving report for order {order.id}: {e}")
            return Response({"error": f"Failed to save report: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def dashboard(request):
    """
    Renders the dedicated radiology dashboard.
    """
    return render(request, 'radio/dashboard.html')

def index(request):
    return render(request, 'placeholder.html')
