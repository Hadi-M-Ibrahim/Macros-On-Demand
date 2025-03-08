from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from bson import ObjectId
from apps.meals.serializers import MealSerializer, FoodItemSerializer
from .models import CustomUser, SavedMeal
from apps.meals.models import FoodItem


# Used when returning a SavedMeal via the user detail endpoint.
class SavedMealSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)
    
    class Meta:
        model = SavedMeal
        fields = ['meal', 'food_item_ids']

# This serializer is used in the user detail endpoint.
class UserSerializer(serializers.ModelSerializer):
    # Using the reverse accessor ("savedmeal_set") for SavedMeal records.
    saved_meals = SavedMealSerializer(source='savedmeal_set', many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal', 'saved_meals']

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

# Custom token serializer that ensures user_id is returned as a string
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user_id"] = str(self.user.id)
        data["user"] = UserSerializer(self.user).data
        return data

class MacroPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal']

# Detailed serializer for SavedMeal, which includes full food item details.
class SavedMealDetailSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)
    food_items = serializers.SerializerMethodField()

    class Meta:
        model = SavedMeal
        fields = ['meal', 'food_items']

    def get_food_items(self, obj):
        if not obj.food_item_ids:
            return []
        try:
            food_ids = [ObjectId(fid) for fid in obj.food_item_ids]
        except Exception:
            return []
        food_items = FoodItem.objects.filter(id__in=food_ids)
        return FoodItemSerializer(food_items, many=True).data
