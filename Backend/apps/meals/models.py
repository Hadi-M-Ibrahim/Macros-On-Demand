from django.db import models

class Meal(models.Model):
    name = models.CharField(max_length=255)
    calories = models.IntegerField()
    protein = models.IntegerField()
    carbs = models.IntegerField()
    fat = models.IntegerField()

    def __str__(self):
        return self.name

