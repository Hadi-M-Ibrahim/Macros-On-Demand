from djongo import models

class Meal(models.Model):
    restaurant = models.CharField(max_length=255)
    calories = models.FloatField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fats = models.FloatField()
    # info about food items that form the meal(item, calories, protein, carbs, fats per food item)
    food_items = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.restaurant} Meal ({self.calories} cal, {self.protein}g protein)"

