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

class GoogleOAuthSerializer(serializers.Serializer):
    """
    Serializer for receiving a Google OAuth ID token.
    """
    token = serializers.CharField()
