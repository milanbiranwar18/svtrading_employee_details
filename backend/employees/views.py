from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeListAPIView(generics.ListAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.db.models import Prefetch
        from attendance.models import AttendanceRecord
        from django.utils import timezone
        today = timezone.now().date()
        
        # Auto-mark forgotten sign-outs from previous days as 'Mismatch'
        AttendanceRecord.objects.filter(
            date__lt=today, 
            sign_out_time__isnull=True
        ).update(status='Mismatch')
        
        return Employee.objects.filter(is_active=True).prefetch_related(
            Prefetch('attendance_records', queryset=AttendanceRecord.objects.filter(date=today), to_attr='today_records')
        ).order_by('name')


class EmployeeCreateAPIView(generics.CreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]


class EmployeeDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
