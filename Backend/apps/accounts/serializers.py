from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.meals.serializers import MealSerializer
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    saved_meals = MealSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email',
            'calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal',
            'saved_meals'
        ]

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Use 'email' as the username field
    username_field = 'email'
    
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        # Look up user by email and check password
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }
        user = CustomUser.objects.filter(email=credentials['email']).first()
        if user is None or not user.check_password(credentials['password']):
            raise serializers.ValidationError("Invalid credentials.")
        
        data = super().validate(attrs)
        data['user'] = UserSerializer(user).data
        return data

class MacroPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['calories_goal', 'protein_goal', 'carbs_goal', 'fats_goal']



