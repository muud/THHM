from django.db import models
from apps.core.models import BaseModel

class DrugInteraction(BaseModel):
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('contraindicated', 'Contraindicated'),
    ]
    drug_a = models.ForeignKey('pharmacy.Drug', on_delete=models.CASCADE, related_name='interactions_a')
    drug_b = models.ForeignKey('pharmacy.Drug', on_delete=models.CASCADE, related_name='interactions_b')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"Interaction: {self.drug_a.name} & {self.drug_b.name} ({self.severity})"


class AlertRule(BaseModel):
    CONDITION_TYPES = [
        ('vitals', 'Vital Signs'),
        ('lab', 'Laboratory Results'),
        ('drug', 'Drug-Drug Interaction'),
        ('allergy', 'Allergy Warning'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField()
    condition_type = models.CharField(max_length=50, choices=CONDITION_TYPES)
    logic_config = models.JSONField(help_text="JSON representation of the alert logic")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PatientRiskScore(BaseModel):
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='risk_scores')
    score_date = models.DateTimeField(auto_now_add=True)
    sepsis_risk = models.FloatField(help_text="Calculated probability of sepsis (0.0 to 1.0)")
    readmission_risk = models.FloatField(help_text="Probability of 30-day readmission")
    calculation_details = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Risk for {self.patient} on {self.score_date.date()}"


class ClinicalAlert(BaseModel):
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='clinical_alerts')
    alert_rule = models.ForeignKey(AlertRule, on_delete=models.CASCADE)
    triggered_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Alert: {self.alert_rule.name} for {self.patient}"
