from djongo import models

class Meal(models.Model):
    restaurant = models.CharField(max_length=255)
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fats = models.FloatField(default=0)
    # info about food items that form the meal(item, calories, protein, carbs, fats per food item)
    food_items = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.restaurant} Meal ({self.calories} cal, {self.protein}g protein)"

