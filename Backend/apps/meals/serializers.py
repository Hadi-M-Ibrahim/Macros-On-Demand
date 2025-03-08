# apps/meals/serializers.py
from rest_framework import serializers
from .models import FoodItem, Meal

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'item_name', 'restaurant', 'food_category', 'calories', 'protein', 'carbohydrates', 'fats']

class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['id', 'restaurant', 'calories', 'protein', 'carbs', 'fats']




