from django.urls import path
from .views import login_view, csrf_token_view, signup # Import csrf_token_view
from django.http import JsonResponse
from django.middleware.csrf import get_token
from user_management.views import user_info
from csv_upload.views import upload_csv


urlpatterns = [
    path("api/login/", login_view, name="login"),
    path("api/csrf/", csrf_token_view, name="csrf_token"),
    path("api/signup/", signup, name="signup"),  # Add CSRF token endpoint
    path('api/user-info/', user_info, name='user_info'), #This user info endpoint
    path('upload-csv/', upload_csv, name='upload_csv'), #This is the upload_csv endpoint
]

