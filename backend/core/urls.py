from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib.auth.views import LogoutView
from django.contrib.auth import views as auth_views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({'username': request.user.username, 'id': request.user.id})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', obtain_auth_token, name='api-token-auth'),
    path('api/auth/me/', me_view, name='api-me'),
    path('api/employees/', include('employees.urls')),
    path('api/attendance/', include('attendance.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
