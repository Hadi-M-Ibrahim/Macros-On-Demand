from rest_framework import serializers
from .models import Meal

class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['id', 'restaurant', 'calories', 'protein', 'carbs', 'fats', 'food_items']
