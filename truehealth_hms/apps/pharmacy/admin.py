from django.contrib import admin
from .models import Category, Drug, DrugBatch, Prescription, PrescriptionItem, Dispensing

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    list_display = ('name', 'generic_name', 'strength', 'form', 'reorder_level')
    search_fields = ('name', 'generic_name')
    list_filter = ('category', 'form')

@admin.register(DrugBatch)
class DrugBatchAdmin(admin.ModelAdmin):
    list_display = ('drug', 'batch_number', 'expiry_date', 'quantity', 'selling_price')
    list_filter = ('expiry_date', 'drug')
    search_fields = ('batch_number',)

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date_prescribed', 'is_dispensed')
    list_filter = ('is_dispensed', 'date_prescribed')
    search_fields = ('patient__mrn', 'patient__user__username')

@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ('prescription', 'drug_batch', 'quantity', 'dosage')

@admin.register(Dispensing)
class DispensingAdmin(admin.ModelAdmin):
    list_display = ('prescription', 'dispensed_by', 'dispensed_date', 'total_amount')