from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView, TemplateView
from apps.core.views import (
    role_redirect, patient_overview_api, login_api, 
    logout_api, get_csrf_token, manage_users_api, 
    delete_user_api, get_staff_status_api, patient_ai_assistant_api
)
from apps.dashboard.views import admin_metrics_api
from apps.management.views import staff_list_api, attendance_toggle_api
from apps.beds.views import (
    all_admissions_api, admit_patient_api, 
    discharge_patient_api, available_beds_api
)
from apps.patients.views import (
    register_patient_api, my_vitals_api, save_vitals_api,
    diagnosis_suggest_api, diagnosis_status_api,
    my_diagnoses_api, save_diagnosis_api,
    patient_full_history_api, patient_list_api
)
from apps.appointments.views import (
    available_slots, book_appointment, my_appointments,
    check_in_api, queue_list_api, update_visit_status_api
)
from apps.pharmacy.views import request_refill, dispense_prescription, my_prescriptions
from apps.billing.views import list_all_invoices_api, process_payment as submit_payment_api
from apps.lab.views import request_lab_test, record_results_api, my_lab_results

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='frontend/index.html')),
    path('redirect/', role_redirect, name='role_redirect'),
    path('dashboard/', include('apps.dashboard.urls')),
    path('appointments/', include('apps.appointments.urls')),
    path('patients/', include('apps.patients.urls')),
    path('pharmacy/', include('apps.pharmacy.urls')),
    path('lab/', include('apps.lab.urls')),
    path('radio/', include('apps.radio.urls')),
    path('staff/', include('apps.staff.urls')),
    path('maternity/', include('apps.maternity.urls')),
    path('immunization/', include('apps.immunization.urls')),
    path('billing/', include('apps.billing.urls')),
    path('api/billing/invoices/', list_all_invoices_api),
    path('api/billing/pay/<int:invoice_id>/', submit_payment_api),
    path('management/', include('apps.management.urls')),
    
    # Direct API paths for frontend dashboard interactivity
    path('api/core/login/', login_api),
    path('api/core/logout/', logout_api),
    path('api/core/csrf/', get_csrf_token),
    path('api/patients/register/', register_patient_api),
    path('api/patients/vitals/', my_vitals_api),
    path('api/patients/vitals/save/', save_vitals_api),
    path('api/patients/diagnoses/', my_diagnoses_api),
    path('api/patients/diagnoses/suggest/', diagnosis_suggest_api),
    path('api/patients/diagnoses/status/<int:pk>/', diagnosis_status_api),
    path('api/patients/diagnoses/save/', save_diagnosis_api),
    path('api/patients/list/', patient_list_api),
    path('api/patients/history/<int:pk>/', patient_full_history_api),
    path('api/beds/admissions/', all_admissions_api),
    path('api/beds/admit/', admit_patient_api),
    path('api/beds/discharge/<int:pk>/', discharge_patient_api),
    path('api/beds/available/', available_beds_api),
    path('api/dashboard/metrics/', admin_metrics_api),
    path('api/core/patient-overview/', patient_overview_api),
    path('api/appointments/available-slots/', available_slots),
    path('api/appointments/book/', book_appointment),
    path('api/appointments/my/', my_appointments),
    path('api/appointments/check-in/', check_in_api),
    path('api/appointments/queue/', queue_list_api),
    path('api/appointments/status/<int:pk>/', update_visit_status_api),
    path('api/pharmacy/refill/', request_refill),
    path('api/pharmacy/dispense/', dispense_prescription),
    path('api/pharmacy/my/', my_prescriptions),
    path('api/lab/request/', request_lab_test),
    path('api/lab/results/record/', record_results_api),
    path('api/lab/my/', my_lab_results),
    path('api/core/users/', manage_users_api),
    path('api/core/users/<int:pk>/', delete_user_api),
    path('api/core/staff-status/', get_staff_status_api),
    path('api/core/ai-assistant/', patient_ai_assistant_api),
    path('api/management/staff/', staff_list_api),
    path('api/management/attendance/toggle/', attendance_toggle_api),
]

admin.site.site_header = "TRUE HEALTH HOSPITAL MANAGEMENT (THHM) ADMINISTRATION"
admin.site.site_title = "TRUE HEALTH HOSPITAL MANAGEMENT (THHM) ADMINISTRATION"
admin.site.index_title = "Welcome to TRUE HEALTH HOSPITAL MANAGEMENT (THHM) ADMINISTRATION"