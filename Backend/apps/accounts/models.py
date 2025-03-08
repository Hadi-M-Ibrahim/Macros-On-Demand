from djongo import models as djongo_models
from django.contrib.auth.models import AbstractUser, Group, Permission
from .managers import CustomUserManager

class SavedMeal(djongo_models.Model):
    customuser = djongo_models.ForeignKey('accounts.CustomUser', on_delete=djongo_models.CASCADE)
    meal = djongo_models.ForeignKey('meals.Meal', on_delete=djongo_models.CASCADE)
    # Field to store list of food item IDs (from JSON payload)
    food_item_ids = djongo_models.JSONField(blank=True, default=list)

    class Meta:
        unique_together = ('customuser', 'meal')

class CustomUser(AbstractUser):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields

    email = djongo_models.EmailField(unique=True, blank=False, null=False)
    
    # Macro goals
    calories_goal = djongo_models.PositiveIntegerField(null=True, blank=True)
    protein_goal = djongo_models.PositiveIntegerField(null=True, blank=True)
    carbs_goal = djongo_models.PositiveIntegerField(null=True, blank=True)
    fats_goal = djongo_models.PositiveIntegerField(null=True, blank=True)

    # Saved meals (through the SavedMeal model)
    saved_meals = djongo_models.ManyToManyField(
        'meals.Meal',
        blank=True,
        related_name='saved_by_users',
        through='accounts.SavedMeal'
    )

    groups = djongo_models.ManyToManyField(
        Group,
        related_name="customuser_groups",
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = djongo_models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    def __str__(self):
        return self.email or self.username























