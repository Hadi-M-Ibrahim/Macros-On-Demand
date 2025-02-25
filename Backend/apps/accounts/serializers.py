# apps/accounts/serializers.py

from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Serializes CustomUser data for profile retrieval.
    """
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal',
            'saved_meals'
        ]
        read_only_fields = ['id', 'saved_meals']

class RegistrationSerializer(serializers.Serializer):
    """
    Serializer for registering a new user with email and password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

class LoginSerializer(serializers.Serializer):
    """
    Serializer for logging in with email and password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


