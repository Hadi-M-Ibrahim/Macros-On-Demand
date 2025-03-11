from django.urls import path
from . import views

urlpatterns = [
    path('options/', views.meal_options_view, name='meal_options'),
    path('ranked/', views.ranked_meal_options_view, name='ranked_meal_options'),
    path('save/', views.save_meal_view, name='save_meal'),
]