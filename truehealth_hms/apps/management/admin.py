from django.contrib import admin
from .models import Staff, Payroll, Expense

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user_full_name', 'department', 'position', 'hire_date')
    list_filter = ('department', 'salary_grade')
    search_fields = ('employee_id', 'user__username', 'user__first_name', 'user__last_name')

    def user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    user_full_name.short_description = 'Name'

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('staff', 'month_display', 'base_salary', 'net_pay', 'status')
    list_filter = ('status', 'month')
    search_fields = ('staff__employee_id', 'staff__user__username')
    date_hierarchy = 'month'
    
    def month_display(self, obj):
        return obj.month.strftime('%b %Y')
    month_display.short_description = 'Month'

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'date', 'approved')
    list_filter = ('approved', 'category', 'date')
    search_fields = ('category', 'description')
    actions = ['approve_expenses']

    def approve_expenses(self, request, queryset):
        queryset.update(approved=True, approved_by=request.user)
    approve_expenses.short_description = "Mark selected as approved"
