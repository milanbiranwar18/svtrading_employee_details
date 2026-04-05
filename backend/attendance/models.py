from django.db import models
from employees.models import Employee

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Half Day', 'Half Day'),
        ('Absent', 'Absent'),
        ('Leave', 'Leave')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    
    sign_in_time = models.DateTimeField(null=True, blank=True)
    sign_in_photo = models.ImageField(upload_to='attendance_photos/in/', null=True, blank=True)
    sign_in_location = models.CharField(max_length=255, null=True, blank=True)
    
    sign_out_time = models.DateTimeField(null=True, blank=True)
    sign_out_photo = models.ImageField(upload_to='attendance_photos/out/', null=True, blank=True)
    sign_out_location = models.CharField(max_length=255, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Absent')
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Total worked hours")
    
    class Meta:
        unique_together = ('employee', 'date')
        
    def __str__(self):
        return f"{self.employee.name} - {self.date} ({self.status})"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=50) # e.g. Sick Leave, Casual Leave
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.employee.name} - {self.leave_type} ({self.status})"
