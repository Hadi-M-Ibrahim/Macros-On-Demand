from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken


from django.contrib.auth import get_user_model
from django.db.models import Prefetch

from apps.accounts.models import CustomUser, SavedMeal
from apps.accounts.serializers import (
    RegistrationSerializer,
    CustomTokenObtainPairSerializer,
    MacroPreferencesSerializer,
    UserSerializer,
    SavedMealDetailSerializer
)
from apps.meals.models import Meal
from apps.meals.serializers import MealSerializer

# Registration view: creates a new user and returns tokens.
class RegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            User = get_user_model()
            if User.objects.filter(email=email).exists():
                return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
            user = User(email=email, username=email)
            user.set_password(password)
            user.save()
            refresh = RefreshToken.for_user(user)
            data = UserSerializer(user).data
            data.update({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login view: returns JWT tokens along with user data.
class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

# MacroPreferences view: get and update user's macro preferences.
class MacroPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        serializer = MacroPreferencesSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = MacroPreferencesSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# UserDetail view: returns user info along with saved meals.
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = get_user_model().objects.get(pk=request.user.pk)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# SavedMeals view: returns a list of saved meals with full food item details.
class SavedMealsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        saved_meals = SavedMeal.objects.filter(customuser=request.user)
        serializer = SavedMealDetailSerializer(saved_meals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# SaveMeal view: creates a Meal and a SavedMeal record.
class SaveMealView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        data = request.data
        meal_restaurant = data.get("restaurant")
        calories = data.get("calories")
        protein = data.get("protein")
        carbs = data.get("carbs")
        fats = data.get("fats")
        food_item_ids = data.get("food_item_ids")

        if not (meal_restaurant and calories is not None and protein is not None and
                carbs is not None and fats is not None and food_item_ids):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        meal = Meal(
            restaurant=meal_restaurant,
            calories=calories,
            protein=protein,
            carbs=carbs,
            fats=fats
        )
        meal.save()

        user = request.user
        saved_meal, created = SavedMeal.objects.get_or_create(customuser=user, meal=meal)
        saved_meal.food_item_ids = food_item_ids
        saved_meal.save()

        meal_data = MealSerializer(meal).data
        meal_data['food_item_ids'] = saved_meal.food_item_ids

        return Response({"message": "Meal saved successfully.", "meal": meal_data},
                        status=status.HTTP_200_OK)









