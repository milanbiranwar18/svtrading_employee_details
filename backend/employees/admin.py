from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'employee_code', 'is_active', 'created_at']
    search_fields = ['name', 'employee_code']
