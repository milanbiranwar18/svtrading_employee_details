from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    today_status = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_today_status(self, obj):
        if hasattr(obj, 'today_records'):
            if obj.today_records:
                record = obj.today_records[0]
                return {
                    'sign_in_time': record.sign_in_time,
                    'sign_out_time': record.sign_out_time,
                    'total_hours': record.total_hours,
                    'status': record.status,
                }
            return None
        
        # Fallback if not prefetched
        from django.utils import timezone
        from attendance.models import AttendanceRecord
        today = timezone.now().date()
        record = AttendanceRecord.objects.filter(employee=obj, date=today).first()
        if record:
            return {
                'sign_in_time': record.sign_in_time,
                'sign_out_time': record.sign_out_time,
                'total_hours': record.total_hours,
                'status': record.status,
            }
        return None
