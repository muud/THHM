from rest_framework import serializers
from .models import XRayOrder, XRayImage, XRayReport
from apps.patients.models import Patient

class XRayImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = XRayImage
        fields = ['id', 'image', 'uploaded_at', 'notes']

class XRayReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = XRayReport
        fields = ['id', 'findings', 'impression', 'ai_findings', 'ai_impression', 'patient_explanation', 'is_ai_generated', 'reported_date', 'is_approved']

class XRayOrderSerializer(serializers.ModelSerializer):
    images = XRayImageSerializer(many=True, read_only=True)
    report = XRayReportSerializer(read_only=True)
    patient_name = serializers.ReadOnlyField(source='patient.get_full_name')

    class Meta:
        model = XRayOrder
        fields = [
            'id', 'patient', 'patient_name', 'body_part', 'clinical_history', 
            'status', 'performed_date', 'images', 'report'
        ]
