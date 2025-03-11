# Backend/macrosondemand/urls.py
"""
URL configuration for macrosondemand project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.shortcuts import redirect
from apps.search.views import meal_options_view, save_meal_view

def home_redirect(request):
    return redirect('/api/auth/signup/')  # Redirect to the sign-in page

urlpatterns = [
    path('', home_redirect, name='home-redirect'),  # Root URL redirects to sign-in
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/search/meal-options/', meal_options_view, name='meal-options'),
    path('api/search/save-meal/', save_meal_view, name='save-meal'),
    path('api/search/ranked-meals/', ranked_meal_options_view, name='ranked-meals'),
]