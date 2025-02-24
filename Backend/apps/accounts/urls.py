from django.urls import path
from .views import GoogleOAuthLoginView

urlpatterns = [
    path('google/', GoogleOAuthLoginView.as_view(), name='google-oauth-login'),
]
