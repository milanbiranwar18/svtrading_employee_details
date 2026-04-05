from django.urls import path
from . import views

urlpatterns = [
    path('', views.EmployeeListAPIView.as_view(), name='employee-list'),
    path('create/', views.EmployeeCreateAPIView.as_view(), name='employee-create'),
    path('<int:pk>/', views.EmployeeDetailAPIView.as_view(), name='employee-detail'),
]
