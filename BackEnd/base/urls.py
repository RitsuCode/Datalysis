from django.urls import path
from .views import login_view, csrf_token_view, signup  # Import csrf_token_view
from django.http import JsonResponse
from django.middleware.csrf import get_token

urlpatterns = [
    path("api/login/", login_view, name="login"),
    path("api/csrf/", csrf_token_view, name="csrf_token"),
    path("api/signup/", signup, name="signup"),  # Add CSRF token endpoint
]

