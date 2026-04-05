from django.contrib import admin
from .models import AttendanceRecord, LeaveRequest

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'sign_in_time', 'sign_out_time', 'total_hours', 'status']
    list_filter = ['status', 'date']
    search_fields = ['employee__name', 'employee__employee_code']
    date_hierarchy = 'date'

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'leave_type']
    search_fields = ['employee__name']
