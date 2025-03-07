from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.meals.models import Meal
from apps.meals.serializers import MealSerializer
from .models import CustomUser
from .serializers import (
    UserSerializer,
    RegistrationSerializer,
    CustomTokenObtainPairSerializer,
    MacroPreferencesSerializer
)


class RegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        """
        Expects JSON payload like:
        {
            "email": "testuser@example.com",
            "password": "mypassword",
            "confirm_password": "mypassword"
        }

        Creates a new user, returning user data plus JWT tokens:
        {
            "id": 1,
            "email": "testuser@example.com",
            "calories_goal": null,
            "protein_goal": null,
            "carbs_goal": null,
            "fats_goal": null,
            "saved_meals": [],
            "access": "<ACCESS_TOKEN>",
            "refresh": "<REFRESH_TOKEN>"
        }
        """
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            if CustomUser.objects.filter(email=email).exists():
                return Response({"error": "User already exists."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user; use email as username.
            user = CustomUser(email=email, username=email)
            user.set_password(password)
            user.save()
            
            # Generate JWT tokens.
            refresh = RefreshToken.for_user(user)
            data = UserSerializer(user).data
            data.update({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """
    Expects JSON payload like:
    {
      "email": "testuser@example.com",
      "password": "mypassword"
    }

    Returns:
    {
      "refresh": "<REFRESH_TOKEN>",
      "access": "<ACCESS_TOKEN>",
      "user": {
          "id": 1,
          "email": "testuser@example.com",
          "calories_goal": null,
          "protein_goal": null,
          "carbs_goal": null,
          "fats_goal": null,
          "saved_meals": []
      }
    }
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class MacroPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Return the authenticated user's macro preferences.
        serializer = MacroPreferencesSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        """
        Expects JSON payload like:
        {
            "calories_goal": 2200,
            "protein_goal": 150,
            "carbs_goal": 200,
            "fats_goal": 70
        }

        Updates the authenticated user's macro preferences, returning:
        {
            "calories_goal": 2200,
            "protein_goal": 150,
            "carbs_goal": 200,
            "fats_goal": 70
        }
        """
        serializer = MacroPreferencesSerializer(
            instance=request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Return full user info
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SaveMealView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        """
        Expects a JSON payload like:
        {
            "restaurant": "Arby's",
            "calories": 470,
            "protein": 29,
            "carbs": 45,
            "fats": 19,
            "food_items": [
                {
                    "item_name": "Classic Beef ‘n Cheddar",
                    "calories": 470,
                    "protein": 29,
                    "carbs": 45,
                    "fats": 19
                },
                ...
            ]
        }

        If a Meal with the same (restaurant, calories, protein, carbs, fats)
        doesn't exist, a new Meal is created. The meal is then added to the
        authenticated user's saved_meals list, returning:
        {
            "message": "Meal saved successfully."
        }
        or, if already saved:
        {
            "message": "Meal already saved."
        }
        """
        serializer = MealSerializer(data=request.data)
        if serializer.is_valid():
            meal_data = serializer.validated_data
            meal, created = Meal.objects.get_or_create(
                restaurant=meal_data['restaurant'],
                calories=meal_data['calories'],
                protein=meal_data['protein'],
                carbs=meal_data['carbs'],
                fats=meal_data['fats'],
                defaults={'food_items': meal_data.get('food_items')}
            )
            user = request.user
            if meal in user.saved_meals.all():
                return Response({"message": "Meal already saved."}, status=status.HTTP_200_OK)
            user.saved_meals.add(meal)
            return Response({"message": "Meal saved successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




