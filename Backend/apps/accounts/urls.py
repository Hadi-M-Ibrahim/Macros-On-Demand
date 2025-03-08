from django.urls import path
from .views import (
    RegistrationView, LoginView, MacroPreferencesView,
    UserDetailView, SaveMealView, SavedMealsView
)

urlpatterns = [
    path('signup/', RegistrationView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('preferences/', MacroPreferencesView.as_view(), name='preferences'), #enter macro preferences
    path('user/', UserDetailView.as_view(), name='user-detail'), #displays userinformation on get request
    path('save-meal/', SaveMealView.as_view(), name='save-meal'), # on right swipe call this
    path('saved-meals/', SavedMealsView.as_view(), name='saved-meals'), #gives users saved meals with food item info if needed on frontend
]

"""
GUIDE FOR FRONTEND TO MAKE CALLS TO THESE API ENDPOINTS

1. Signup Endpoint
-------------------
URL:        /api/auth/signup/
Method:     POST
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
URL:        /api/auth/login/
Method:     POST
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


3. Macro Preferences Input Endpoint
------------------------------
URL:        /api/auth/preferences/
Method:     GET
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

URL:        /api/auth/preferences/
Method:     POST
Headers:    Authorization: Bearer <ACCESS_TOKEN>
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


4. User Detail Endpoint
------------------------
URL:        /api/auth/user/
Method:     GET
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
Description: Returns the authenticated user's information, including email, macro preferences,
             and a list of saved meals (each saved meal includes meal details and the stored food_item_ids).


5. Save Meal Endpoint
----------------------
URL:        /api/auth/save-meal/
Method:     POST
Headers:    Content-Type: application/json, Authorization: Bearer <ACCESS_TOKEN>
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
Description: Creates a new Meal record and a SavedMeal record linking the meal to the user.
             The provided list of food_item_ids is stored in SavedMeal. The response returns the meal
             details along with the stored food_item_ids.


6. Saved Meals Endpoint
------------------------
URL:        /api/auth/saved-meals/
Method:     GET
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
             - A nested "food_items" array with full details for each FoodItem.
             (The food_items are looked up by converting the stored food_item_ids to ObjectIds and querying the FoodItem collection.)
"""
