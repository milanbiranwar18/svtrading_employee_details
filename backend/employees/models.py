from django.db import models
from django.contrib.auth.models import User

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, help_text="Linked admin user if applicable")
    name = models.CharField(max_length=255)
    employee_code = models.CharField(max_length=50, unique=True, help_text="Unique employee code e.g., ITA-M1806")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.employee_code})"
