# apps/meals/models.py
from djongo import models as djongo_models
from django.db import models

class FoodItem(models.Model):
    id = djongo_models.ObjectIdField(primary_key=True, editable=False)
    item_name = models.CharField(max_length=255)
    restaurant = models.CharField(max_length=255, blank=True, default='')
    food_category = models.CharField(max_length=255, blank=True, default='')
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbohydrates = models.FloatField(default=0)
    fats = models.FloatField(default=0)

    def __str__(self):
        return self.item_name

class Meal(models.Model):
    id = djongo_models.ObjectIdField(primary_key=True, editable=False)
    restaurant = models.CharField(max_length=255)
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fats = models.FloatField(default=0)

    food_item_ids = djongo_models.JSONField(blank=True, default=list)

    def __str__(self):
        return f"{self.restaurant} Meal (Total: {self.calories} cal)"

























