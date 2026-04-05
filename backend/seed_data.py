"""
SV Trading — Dummy Data Seeder
Run: python seed_data.py  (from the backend/ directory with venv active)
"""
import os
import sys
import django
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from employees.models import Employee
from attendance.models import AttendanceRecord, LeaveRequest

# ── Colour helpers ───────────────────────────────────────────────────────────
GREEN  = '\033[92m'
YELLOW = '\033[93m'
CYAN   = '\033[96m'
RESET  = '\033[0m'
BOLD   = '\033[1m'

def ok(msg):  print(f"  {GREEN}✓{RESET}  {msg}")
def info(msg): print(f"  {CYAN}→{RESET}  {msg}")
def warn(msg): print(f"  {YELLOW}!{RESET}  {msg}")

print(f"\n{BOLD}{'='*55}{RESET}")
print(f"{BOLD}   SV Trading — Dummy Data Seeder{RESET}")
print(f"{BOLD}{'='*55}{RESET}\n")

# ── 1. Create / ensure admin superuser ───────────────────────────────────────
info("Setting up admin user…")
admin, created = User.objects.get_or_create(username='admin')
admin.set_password('admin123')
admin.is_staff = True
admin.is_superuser = True
admin.save()
ok(f"Admin user {'created' if created else 'already exists'} (admin / admin123)")

# ── 2. Employee definitions ──────────────────────────────────────────────────
EMPLOYEES = [
    ("Arjun Mehta",         "SVT-001"),
    ("Priya Sharma",        "SVT-002"),
    ("Rahul Verma",         "SVT-003"),
    ("Sneha Patel",         "SVT-004"),
    ("Vikram Singh",        "SVT-005"),
    ("Kavita Rao",          "SVT-006"),
    ("Deepak Joshi",        "SVT-007"),
    ("Ananya Gupta",        "SVT-008"),
]

info(f"Creating {len(EMPLOYEES)} employees…")
employees = []
for name, code in EMPLOYEES:
    emp, created = Employee.objects.get_or_create(
        employee_code=code,
        defaults={'name': name, 'is_active': True}
    )
    if not created:
        emp.name = name
        emp.is_active = True
        emp.save()
    employees.append(emp)
    ok(f"  {name:<22} [{code}]  {'new' if created else 'exists'}")

# ── 3. Attendance helper ─────────────────────────────────────────────────────
IST = timezone.get_current_timezone()   # Asia/Kolkata

def make_dt(d: date, hour: int, minute: int):
    return timezone.make_aware(
        datetime(d.year, d.month, d.day, hour, minute),
        IST
    )

def random_sign_in():
    """Return (hour, minute) for a sign-in roughly 9:00–9:45"""
    return 9, random.randint(0, 45)

def random_sign_out(half=False):
    """Return (hour, minute) for a sign-out: 14:00–14:30 for half, 17:30–19:30 for full"""
    if half:
        return 14, random.randint(0, 30)
    return random.randint(17, 19), random.randint(0, 59)

def hours_between(sign_in, sign_out):
    diff = (sign_out - sign_in).total_seconds() / 3600
    return round(diff, 2)

def status_from(sign_in, sign_out, is_leave=False):
    if is_leave:
        return 'Leave'
    if not sign_in:
        return 'Absent'
    if not sign_out:
        return 'Present'
    hrs = hours_between(sign_in, sign_out)
    if hrs >= 7:
        return 'Present'
    if hrs >= 3.5:
        return 'Half Day'
    return 'Absent'

# ── 4. Generate attendance for last 2 months ─────────────────────────────────
today = date.today()
start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)  # 2 months ago

info(f"Generating attendance from {start_date} → {today}…")
AttendanceRecord.objects.filter(employee__in=employees, date__gte=start_date).delete()

# Pre-generate leave date ranges per employee (so we can mark records as Leave)
leave_spans = {}   # emp.id -> list of (start, end)
LEAVE_POOL = [
    ("Sick Leave",      "Fever and cold"),
    ("Casual Leave",    "Personal work"),
    ("Annual Leave",    "Family vacation"),
    ("Emergency Leave", "Family emergency"),
    ("Unpaid Leave",    "Extended absence"),
]

created_count = 0
current = start_date
while current <= today:
    weekday = current.weekday()            # 0=Mon … 6=Sun
    is_weekend = weekday >= 5

    for emp in employees:
        # Skip weekends entirely — no record
        if is_weekend:
            current_next = current  # handled below
            continue

        roll = random.random()

        # 5% chance of leave day (only for non-weekend)
        is_leave = roll < 0.05
        # 8% chance absent
        is_absent = not is_leave and roll < 0.13

        si, so, hrs, stat = None, None, None, 'Absent'

        if is_leave:
            stat = 'Leave'
        elif not is_absent:
            h_in,  m_in  = random_sign_in()
            is_half = random.random() < 0.1   # 10% half-day
            h_out, m_out = random_sign_out(half=is_half)
            si   = make_dt(current, h_in,  m_in)
            so   = make_dt(current, h_out, m_out)
            hrs  = hours_between(si, so)
            stat = status_from(si, so)

        AttendanceRecord.objects.create(
            employee=emp,
            date=current,
            sign_in_time=si,
            sign_in_location='SV Trading Office, Rajkot' if si else None,
            sign_out_time=so,
            sign_out_location='SV Trading Office, Rajkot' if so else None,
            status=stat,
            total_hours=Decimal(str(hrs)) if hrs else None,
        )
        created_count += 1

    current += timedelta(days=1)

ok(f"Created {created_count} attendance records")

# ── 5. Leave Requests ────────────────────────────────────────────────────────
info("Creating leave requests…")
LeaveRequest.objects.filter(employee__in=employees).delete()

leave_data = [
    # (employee_index, leave_type, days_ago_start, duration, status, reason)
    (0, "Sick Leave",      25, 2, "Approved",  "High fever and doctor advised rest"),
    (1, "Casual Leave",    15, 1, "Approved",  "Personal work at government office"),
    (2, "Annual Leave",    10, 3, "Pending",   "Annual family vacation to Goa"),
    (3, "Emergency Leave",  5, 2, "Approved",  "Medical emergency of parent"),
    (4, "Sick Leave",       3, 1, "Pending",   "Cold and mild fever"),
    (5, "Casual Leave",    20, 1, "Rejected",  "Personal errand"),
    (6, "Annual Leave",    45, 5, "Approved",  "Pre-planned vacation leave"),
    (7, "Unpaid Leave",    30, 3, "Rejected",  "Extended personal leave requested"),
    (0, "Casual Leave",    60, 1, "Approved",  "Bank work"),
    (2, "Sick Leave",      50, 2, "Approved",  "Viral infection"),
]

for emp_idx, leave_type, days_ago, duration, status, reason in leave_data:
    s = today - timedelta(days=days_ago)
    e = s + timedelta(days=duration - 1)
    LeaveRequest.objects.create(
        employee=employees[emp_idx],
        leave_type=leave_type,
        start_date=s,
        end_date=e,
        reason=reason,
        status=status,
    )
    ok(f"  {employees[emp_idx].name:<22} → {leave_type} ({status})")

# ── 6. Summary ───────────────────────────────────────────────────────────────
print(f"\n{BOLD}{'='*55}{RESET}")
print(f"{BOLD}   Seed complete! Here's what was created:{RESET}")
print(f"{'='*55}")
print(f"  Admin user   : admin / admin123")
print(f"  Employees    : {Employee.objects.count()}")
print(f"  Attendance   : {AttendanceRecord.objects.count()} records")
print(f"  Leaves       : {LeaveRequest.objects.count()} requests")
print(f"\n  Frontend  →  http://localhost:5173")
print(f"  Backend   →  http://localhost:8000")
print(f"  Admin UI  →  http://localhost:8000/admin\n")
print(f"{GREEN}{BOLD}  ✓ Ready to test!{RESET}\n")
