from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        
        ('Macros', {'fields': ('calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)



