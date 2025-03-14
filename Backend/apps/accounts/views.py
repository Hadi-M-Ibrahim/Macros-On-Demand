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

# Additional imports for Google OAuth
from django.conf import settings
from urllib.parse import urlencode
import requests

# Google OAuth endpoints

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        # Build the Google authorization URL.
        google_client_id = settings.GOOGLE_CLIENT_ID  # Must be set in your settings
        redirect_uri = request.build_absolute_uri('/callback/google/')
        scope = "email profile"
        auth_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": google_client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": scope,
            "access_type": "offline",
            "prompt": "select_account"
        }
        auth_url_with_params = auth_url + "?" + urlencode(params)
        return Response({"authorization_url": auth_url_with_params}, status=status.HTTP_200_OK)

class GoogleCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        # Retrieve the authorization code from the query parameters.
        code = request.GET.get("code")
        if not code:
            return Response({"error": "No code provided."}, status=status.HTTP_400_BAD_REQUEST)

        google_client_id = settings.GOOGLE_CLIENT_ID
        google_client_secret = settings.GOOGLE_CLIENT_SECRET
        redirect_uri = request.build_absolute_uri('/callback/google/')
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": google_client_id,
            "client_secret": google_client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        try:
            token_response = requests.post(token_url, data=data)
            token_response.raise_for_status()
        except requests.RequestException as e:
            return Response({"error": "Failed to obtain token from Google: " + str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        token_json = token_response.json()
        access_token_google = token_json.get("access_token")
        if not access_token_google:
            return Response({"error": "No access token in token response."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user_info_response = requests.get("https://www.googleapis.com/oauth2/v1/userinfo",
                                              params={"access_token": access_token_google})
            user_info_response.raise_for_status()
        except requests.RequestException as e:
            return Response({"error": "Failed to fetch user info from Google: " + str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        user_info = user_info_response.json()

        # Process user_info: extract email and either create or update the user.
        email = user_info.get("email")
        if not email:
            return Response({"error": "Email not provided by Google."},
                            status=status.HTTP_400_BAD_REQUEST)
        User = get_user_model()
        user, created = User.objects.get_or_create(email=email, defaults={"username": email})
        if created:
            user.set_unusable_password()  # Passwordless login; adjust if needed
            user.save()
        refresh = RefreshToken.for_user(user)
        token_data = {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": UserSerializer(user).data,
        }
        return Response(token_data, status=status.HTTP_200_OK)

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

# DeleteMeal view: deletes a user's meal.
class DeleteMealView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, meal_id, format=None):
        try:
            saved_meal = SavedMeal.objects.get(customuser=request.user, meal__id=meal_id)
        except SavedMeal.DoesNotExist:
            return Response({"error": "Meal not found or not saved by this user."},
                            status=status.HTTP_404_NOT_FOUND)

        saved_meal.delete()

        try:
            meal = Meal.objects.get(id=meal_id)
            meal.delete()
        except Meal.DoesNotExist:
            pass

        return Response({"message": "Meal deleted successfully"}, status=status.HTTP_200_OK)

# CheckEmail view: checks if an email already exists in the system.
class CheckEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, format=None):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        User = get_user_model()
        exists = User.objects.filter(email=email).exists()
        
        if exists:
            return Response({"exists": True, "message": "User already exists."}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"exists": False, "message": "Email is available."}, 
                       status=status.HTTP_200_OK)
