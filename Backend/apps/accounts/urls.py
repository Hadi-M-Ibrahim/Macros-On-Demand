from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistrationView, LoginView, MacroPreferencesView,
    UserDetailView, SaveMealView, SavedMealsView, DeleteMealView
)

urlpatterns = [
    path('signup/', RegistrationView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('preferences/', MacroPreferencesView.as_view(), name='preferences'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('save-meal/', SaveMealView.as_view(), name='save-meal'),
    path('saved-meals/', SavedMealsView.as_view(), name='saved-meals'),
    path('delete-meal/<int:meal_id>/', DeleteMealView.as_view(), name='delete_meal'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]



"""
GUIDE FOR FRONTEND TO MAKE CALLS TO API ENDPOINTS

Base URL: /api/auth/

1. Signup Endpoint
-------------------
URL:        POST /api/auth/signup/
Headers:    Content-Type: application/json
Payload:
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "confirm_password": "StrongPassword123!"
}
Response (example):
{
  "id": 1,
  "email": "user@example.com",
  "calories_goal": null,
  "protein_goal": null,
  "carbs_goal": null,
  "fats_goal": null,
  "saved_meals": [],
  "access": "<ACCESS_TOKEN>",
  "refresh": "<REFRESH_TOKEN>"
}
Description: Creates a new user and returns user details along with JWT tokens.

2. Login Endpoint
------------------
URL:        POST /api/auth/login/
Headers:    Content-Type: application/json
Payload:
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
Response (example):
{
  "refresh": "<REFRESH_TOKEN>",
  "access": "<ACCESS_TOKEN>",
  "user": {
      "id": 1,
      "email": "user@example.com",
      "calories_goal": null,
      "protein_goal": null,
      "carbs_goal": null,
      "fats_goal": null,
      "saved_meals": []
  }
}
Description: Authenticates the user and returns JWT tokens along with basic user info.
Note: Save the access token for subsequent authenticated requests.

3. Refresh Token Endpoint
--------------------------
URL:        POST /api/auth/token/refresh/
Headers:    Content-Type: application/json
Payload:
{
  "refresh": "<REFRESH_TOKEN>"
}
Response (example):
{
  "access": "<NEW_ACCESS_TOKEN>"
}
Description: Uses the provided refresh token to generate a new access token.

4. Macro Preferences Endpoint
------------------------------
GET Macro Preferences:
URL:        GET /api/auth/preferences/
Headers:    Authorization: Bearer <ACCESS_TOKEN>
Payload:    None
Response (example):
{
  "calories_goal": 2200,
  "protein_goal": 150,
  "carbs_goal": 200,
  "fats_goal": 70
}
Description: Returns the current user's macro preferences.

POST Macro Preferences:
URL:        POST /api/auth/preferences/
Headers:    Authorization: Bearer <ACCESS_TOKEN>, Content-Type: application/json
Payload:
{
  "calories_goal": 2200,
  "protein_goal": 150,
  "carbs_goal": 200,
  "fats_goal": 70
}
Response (example):
{
  "calories_goal": 2200,
  "protein_goal": 150,
  "carbs_goal": 200,
  "fats_goal": 70
}
Description: Updates the macro preferences and returns the updated values.

5. User Detail Endpoint
------------------------
URL:        GET /api/auth/user/
Headers:    Authorization: Bearer <ACCESS_TOKEN>
Payload:    None
Response (example):
{
  "id": 1,
  "email": "user@example.com",
  "calories_goal": 2200,
  "protein_goal": 150,
  "carbs_goal": 200,
  "fats_goal": 70,
  "saved_meals": [
    {
      "meal": {
          "id": "<meal_id>",
          "restaurant": "Unique Restaurant Inc.",
          "calories": 750.0,
          "protein": 50.0,
          "carbs": 80.0,
          "fats": 30.0
      },
      "food_item_ids": [
         "67cbcd5d57283efc873ae064",
         "67cbcd5e57283efc873ae066"
      ]
    }
  ]
}
Description: Returns the authenticated user's information, including email, macro preferences, and a list of saved meals (each saved meal includes meal details and the stored food_item_ids).

6. Save Meal Endpoint
----------------------
URL:        POST /api/auth/save-meal/
Headers:    Authorization: Bearer <ACCESS_TOKEN>, Content-Type: application/json
Payload:
{
  "restaurant": "Unique Restaurant Inc.",
  "calories": 750,
  "protein": 50,
  "carbs": 80,
  "fats": 30,
  "food_item_ids": [
    "67cbcd5d57283efc873ae064",
    "67cbcd5e57283efc873ae066"
  ]
}
Response (example):
{
  "message": "Meal saved successfully.",
  "meal": {
      "id": "<meal_id>",
      "restaurant": "Unique Restaurant Inc.",
      "calories": 750.0,
      "protein": 50.0,
      "carbs": 80.0,
      "fats": 30.0,
      "food_item_ids": [
         "67cbcd5d57283efc873ae064",
         "67cbcd5e57283efc873ae066"
      ]
  }
}
Description: Creates a new Meal record and a SavedMeal record linking the meal to the user; stores the provided food_item_ids.

7. Saved Meals Endpoint
------------------------
URL:        GET /api/auth/saved-meals/
Headers:    Authorization: Bearer <ACCESS_TOKEN>
Payload:    None
Response (example):
[
  {
    "meal": {
        "id": "<meal_id>",
        "restaurant": "Unique Restaurant Inc.",
        "calories": 750.0,
        "protein": 50.0,
        "carbs": 80.0,
        "fats": 30.0
    },
    "food_items": [
      {
        "id": "67cbcd5d57283efc873ae064",
        "item_name": "Classic Beef ‘n Cheddar",
        "restaurant": "Arby's",
        "food_category": "Sandwiches",
        "calories": 470.0,
        "protein": 29.0,
        "carbohydrates": 45.0,
        "fats": 19.0
      },
      {
        "id": "67cbcd5e57283efc873ae066",
        "item_name": "Another Food Item",
        "restaurant": "Some Restaurant",
        "food_category": "Salads",
        "calories": 300.0,
        "protein": 20.0,
        "carbohydrates": 35.0,
        "fats": 10.0
      }
    ]
  }
]
Description: Returns a list of the current user's saved meals. Each saved meal includes:
             - The meal details (id, restaurant, calories, protein, carbs, fats)
             - A nested "food_items" array with full details for each FoodItem (fetched by converting the stored food_item_ids to ObjectIds).

8. Delete Meal Endpoint
-------------------------
URL:        DELETE /api/auth/delete-meal/<meal_id>/
Headers:    Authorization: Bearer <ACCESS_TOKEN>
Payload:    None
Response (example):
{
  "message": "Meal deleted successfully"
}
Description: Deletes the saved meal record for the current user and removes the corresponding Meal record from the database completely.  
"""
