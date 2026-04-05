from django.urls import path
from . import views

urlpatterns = [
    path('sign-in/', views.SignInView.as_view(), name='sign-in'),
    path('sign-out/', views.SignOutView.as_view(), name='sign-out'),
    path('status/<int:employee_id>/', views.TodayStatusView.as_view(), name='today-status'),
    path('monthly/<int:employee_id>/', views.MonthlyAttendanceView.as_view(), name='monthly-attendance'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('manual/', views.ManualAttendanceView.as_view(), name='manual-attendance'),
    path('all/', views.AllAttendanceView.as_view(), name='all-attendance'),
    path('export/', views.ExportAttendanceView.as_view(), name='export-attendance'),
    path('leaves/', views.LeaveRequestListCreateView.as_view(), name='leave-list-create'),
    path('leaves/<int:pk>/', views.LeaveRequestUpdateView.as_view(), name='leave-update'),
]
