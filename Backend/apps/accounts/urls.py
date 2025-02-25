# apps/accounts/urls.py

from django.urls import path
from .views import RegistrationView, LoginView

urlpatterns = [
    path('signup/', RegistrationView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
]

