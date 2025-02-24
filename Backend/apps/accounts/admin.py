from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for CustomUser.
    """
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal', 'saved_meals')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)

