from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    # Extra fields for macros
    calories_goal = models.PositiveIntegerField(null=True, blank=True)
    protein_goal = models.PositiveIntegerField(null=True, blank=True)
    carbs_goal = models.PositiveIntegerField(null=True, blank=True)
    fats_goal = models.PositiveIntegerField(null=True, blank=True)
    
   
    saved_meals = models.ManyToManyField(
        'meals.Meal', 
        blank=True,
        related_name='saved_by_users'
    )

    # Override inherited fields to avoid clashes with the built-in User model.
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_groups",  # New related name to avoid clash
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",  # New related name to avoid clash
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.email or self.username


