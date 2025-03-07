from django.urls import path
from .views import RegistrationView, LoginView, MacroPreferencesView, UserDetailView

urlpatterns = [
    path('signup/', RegistrationView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('preferences/', MacroPreferencesView.as_view(), name='preferences'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
]


