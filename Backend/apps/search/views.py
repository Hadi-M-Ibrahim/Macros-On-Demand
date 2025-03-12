from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import threading
import time
import random

from .script import check_meal_options, save_meal_to_db
from .rank_meals import rank_meal_options

def get_sample_meals(calorie_limit, protein_limit, carb_limit, fat_limit, count=10):
    """Generate sample meals for testing when real calculation would take too long"""
    restaurants = ["McDonald's", "Burger King", "Wendy's", "Taco Bell", "KFC"]
    sample_meals = []
    
    for i in range(count):
        calories = random.randint(int(calorie_limit * 0.7), calorie_limit)
        protein = random.randint(int(protein_limit * 0.7), protein_limit)
        carbs = random.randint(int(carb_limit * 0.7), carb_limit)
        fats = random.randint(int(fat_limit * 0.7), fat_limit)
        
        restaurant = random.choice(restaurants)
        
        meal = {
            "message": "Meal option generated successfully.",
            "meal": {
                "restaurant": restaurant,
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fats": fats,
                "food_item_ids": [f"sample_item_{j}" for j in range(1, random.randint(2, 4))]
            }
        }
        
        sample_meals.append({
            "rank": i + 1,
            "rmse": random.uniform(10, 50),
            "avg_utilization": random.uniform(70, 95),
            "utilization": {
                "calories": (calories / calorie_limit) * 100,
                "protein": (protein / protein_limit) * 100,
                "carbs": (carbs / carb_limit) * 100,
                "fats": (fats / fat_limit) * 100
            },
            "meal_option": meal
        })
    
    return sample_meals
    
# Create background task for computationally intensive operations
def process_in_background(func, *args, **kwargs):
    thread = threading.Thread(target=func, args=args, kwargs=kwargs)
    thread.daemon = True
    thread.start()
    return thread

@require_http_methods(["GET"])
def meal_options_view(request):
    """
    View function to get meal options based on specified macronutrient limits
    """
    try:
        # Get user-defined macronutrient constraints from query parameters
        calorie_limit = int(request.GET.get("calories", 800))
        protein_limit = int(request.GET.get("protein", 50))
        carb_limit = int(request.GET.get("carbs", 100))
        fat_limit = int(request.GET.get("fats", 30))
        
        # Optional parameters
        limit = int(request.GET.get("limit", 50))  # Limit number of results
        
        # Tracking time for performance monitoring
        start_time = time.time()

        # Generate valid meal options
        valid_meals = check_meal_options(
            calorie_limit, 
            protein_limit, 
            carb_limit, 
            fat_limit, 
            max_items=4, 
            limit=limit
        )
        
        # Logging performance info
        duration = time.time() - start_time
        print(f"Meal generation completed in {duration:.2f} seconds. Found {len(valid_meals)} valid meals.")

        return JsonResponse({
            "count": len(valid_meals),
            "duration_seconds": round(duration, 2),
            "valid_meals": valid_meals
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "error": str(e)
        }, status=400)

@require_http_methods(["GET"])
def ranked_meal_options_view(request):
    """
    Simplified view function to get ranked meal options based on how close they are to the specified limits.
    This version returns hardcoded sample meals for quick testing.
    """
    try:
        # Get user-defined macronutrient constraints from query parameters
        calorie_limit = int(request.GET.get("calories", 800))
        protein_limit = int(request.GET.get("protein", 50))
        carb_limit = int(request.GET.get("carbs", 100))
        fat_limit = int(request.GET.get("fats", 30))
        
        # Optional parameter for how many sample meals to return
        top_n = int(request.GET.get("top_n", 10))
        
        # Use sample meals for quick testing
        sample_meals = get_sample_meals(calorie_limit, protein_limit, carb_limit, fat_limit, top_n)
        
        # Format response
        formatted_result = {
            "count": len(sample_meals),
            "duration_seconds": 0.1,
            "ranked_meals": sample_meals
        }
        
        return JsonResponse(formatted_result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "error": str(e)
        }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def save_meal_view(request):
    """
    View function to save a selected meal to the database
    """
    try:
        # Parse request body
        data = json.loads(request.body)
        
        # Validate input
        required_fields = ["restaurant", "food_item_ids", "macros"]
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    "error": f"Missing required field: {field}"
                }, status=400)
        
        # Validate macros
        required_macros = ["calories", "protein", "carbs", "fats"]
        for macro in required_macros:
            if macro not in data["macros"]:
                return JsonResponse({
                    "error": f"Missing required macro: {macro}"
                }, status=400)

        # Save meal to database
        result = save_meal_to_db(data)
        
        if result.get("error"):
            return JsonResponse(result, status=500)
            
        return JsonResponse(result)
    except json.JSONDecodeError:
        return JsonResponse({
            "error": "Invalid JSON in request body"
        }, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "error": str(e)
        }, status=500)
