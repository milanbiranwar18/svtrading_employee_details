"""
Seed command: python manage.py seed_data
Creates 8 employees with 3 months of attendance history for testing.
"""
import random
from datetime import date, timedelta, datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from employees.models import Employee
from attendance.models import AttendanceRecord, LeaveRequest

User = get_user_model()

EMPLOYEES = [
    ("Milankumar Biranwar",  "SVT-001"),
    ("Raj Sharma",           "SVT-002"),
    ("Priya Patel",          "SVT-003"),
    ("Amit Verma",           "SVT-004"),
    ("Sneha Joshi",          "SVT-005"),
    ("Ravi Kumar",           "SVT-006"),
    ("Anjali Singh",         "SVT-007"),
    ("Deepak Mehta",         "SVT-008"),
]

# Typical office hours with some variation
SIGN_IN_BASE  = datetime.strptime("09:30", "%H:%M")
SIGN_OUT_BASE = datetime.strptime("18:30", "%H:%M")


def rand_minutes(base, offset_range=40):
    delta = random.randint(-offset_range, offset_range)
    return base + timedelta(minutes=delta)


class Command(BaseCommand):
    help = "Seed dummy employees and 3 months of attendance data for testing"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("\n🌱  Seeding dummy data..."))

        # ── Employees ─────────────────────────────────────────────
        employees = []
        for name, code in EMPLOYEES:
            emp, created = Employee.objects.get_or_create(
                employee_code=code,
                defaults={"name": name, "is_active": True}
            )
            if not created:
                emp.name = name
                emp.save()
            employees.append(emp)
            status = "Created" if created else "Already exists"
            self.stdout.write(f"  👤 {status}: {name} ({code})")

        # ── Attendance for last 3 months ──────────────────────────
        today = date.today()
        # Start from first day of 3 months ago
        if today.month > 3:
            start_month = today.month - 3
            start_year  = today.year
        else:
            start_month = today.month - 3 + 12
            start_year  = today.year - 1
        start_date = date(start_year, start_month, 1)

        total_records = 0
        for emp in employees:
            current = start_date
            while current <= today:
                weekday = current.weekday()   # 0=Mon … 6=Sun
                is_weekend = weekday >= 6     # Sunday off (Saturday half-day possible)

                # Skip Sundays
                if weekday == 6:
                    current += timedelta(days=1)
                    continue

                # Random absence (~8% chance on weekdays)
                if random.random() < 0.08:
                    current += timedelta(days=1)
                    continue

                # Saturday → shorter day / half day
                if weekday == 5:
                    sign_in  = rand_minutes(datetime.strptime("09:30", "%H:%M"), 20)
                    sign_out = rand_minutes(datetime.strptime("14:00", "%H:%M"), 30)
                else:
                    sign_in  = rand_minutes(SIGN_IN_BASE,  40)
                    sign_out = rand_minutes(SIGN_OUT_BASE, 40)

                # Make datetimes timezone-aware
                aware_in  = timezone.make_aware(datetime.combine(current, sign_in.time()))
                aware_out = timezone.make_aware(datetime.combine(current, sign_out.time()))

                delta_hours = Decimal(str(round(
                    (aware_out - aware_in).total_seconds() / 3600, 2
                )))

                if delta_hours < Decimal("4.5"):
                    rec_status = "Half Day"
                else:
                    rec_status = "Present"

                record, _ = AttendanceRecord.objects.update_or_create(
                    employee=emp,
                    date=current,
                    defaults={
                        "sign_in_time":      aware_in,
                        "sign_out_time":     aware_out,
                        "sign_in_location":  "Office - SV Trading, Ahmedabad",
                        "sign_out_location": "Office - SV Trading, Ahmedabad",
                        "status":            rec_status,
                        "total_hours":       delta_hours,
                    }
                )
                total_records += 1
                current += timedelta(days=1)

        self.stdout.write(f"\n  📅 Created/updated {total_records} attendance records")

        # ── Leave Requests ────────────────────────────────────────
        leave_count = 0
        for emp in employees[:5]:   # first 5 employees have leave requests
            start = today - timedelta(days=random.randint(5, 25))
            end   = start + timedelta(days=random.randint(0, 2))
            leave, created = LeaveRequest.objects.get_or_create(
                employee=emp,
                start_date=start,
                defaults={
                    "end_date":   end,
                    "leave_type": random.choice(["Sick Leave", "Casual Leave", "Annual Leave"]),
                    "reason":     random.choice([
                        "Feeling unwell, need rest.",
                        "Personal work at home.",
                        "Family function.",
                        "Medical appointment.",
                    ]),
                    "status": random.choice(["Pending", "Approved", "Approved", "Rejected"]),
                }
            )
            if created:
                leave_count += 1

        self.stdout.write(f"  📝 Created {leave_count} leave requests\n")
        self.stdout.write(self.style.SUCCESS("✅  Dummy data seeded successfully!\n"))
        self.stdout.write("  ─────────────────────────────────────────────")
        self.stdout.write("  Admin login  →  http://127.0.0.1:8000/admin/")
        self.stdout.write("  Frontend     →  http://localhost:5173/")
        self.stdout.write("  API docs     →  http://127.0.0.1:8000/api/employees/")
        self.stdout.write("  ─────────────────────────────────────────────\n")
