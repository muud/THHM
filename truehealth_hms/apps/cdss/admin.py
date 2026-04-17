from django.contrib import admin
from .models import DrugInteraction, AlertRule, PatientRiskScore, ClinicalAlert

@admin.register(DrugInteraction)
class DrugInteractionAdmin(admin.ModelAdmin):
    list_display = ('drug_a', 'drug_b', 'severity')
    list_filter = ('severity',)
    search_fields = ('drug_a__name', 'drug_b__name')

@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'condition_type', 'is_active')
    list_filter = ('condition_type', 'is_active')

@admin.register(PatientRiskScore)
class PatientRiskScoreAdmin(admin.ModelAdmin):
    list_display = ('patient', 'score_date', 'sepsis_risk', 'readmission_risk')
    list_filter = ('score_date',)

@admin.register(ClinicalAlert)
class ClinicalAlertAdmin(admin.ModelAdmin):
    list_display = ('patient', 'alert_rule', 'triggered_at', 'is_resolved')
    list_filter = ('is_resolved', 'triggered_at')
