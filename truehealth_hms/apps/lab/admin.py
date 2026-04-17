from django.contrib import admin
from .models import TestCategory, Test, TestRequest, TestRequestItem, Sample

@admin.register(TestCategory)
class TestCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'normal_range', 'unit', 'price')
    search_fields = ('name', 'code')
    list_filter = ('category',)

@admin.register(TestRequest)
class TestRequestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'requested_by', 'status', 'requested_date')
    list_filter = ('status', 'requested_date')
    search_fields = ('patient__mrn', 'patient__user__username')
    readonly_fields = ('requested_date',)

@admin.register(TestRequestItem)
class TestRequestItemAdmin(admin.ModelAdmin):
    list_display = ('test_request', 'test', 'result_value', 'is_abnormal')
    list_filter = ('is_abnormal',)

@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    list_display = ('test_request', 'collected_by', 'collected_date', 'sample_type')
    list_filter = ('sample_type',)
