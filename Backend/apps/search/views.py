from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .script import check_meal_options, save_meal_to_db
from .rank_meals import rank_meal_options, get_top_ranked_meals, get_top_ranked_meals_by_restaurant

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

        # Call the function from script.py to generate valid meal options
        valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)

        return JsonResponse({
            "count": len(valid_meals),
            "valid_meals": valid_meals
        })
    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)

@require_http_methods(["GET"])
def ranked_meal_options_view(request):
    """
    View function to get ranked meal options based on how close they are to the specified limits
    """
    try:
        # get user-defined macronutrient constraints from query parameters
        calorie_limit = int(request.GET.get("calories", 800))
        protein_limit = int(request.GET.get("protein", 50))
        carb_limit = int(request.GET.get("carbs", 100))
        fat_limit = int(request.GET.get("fats", 30))
        
        # optional parameters
        top_n = int(request.GET.get("top_n", 10))
        by_restaurant = request.GET.get("by_restaurant", "false").lower() == "true"
        top_n_per_restaurant = int(request.GET.get("top_n_per_restaurant", 3))
        
        if by_restaurant:
            # get top meals by restaurant
            top_meals = get_top_ranked_meals_by_restaurant(
                calorie_limit, protein_limit, carb_limit, fat_limit, top_n_per_restaurant
            )
            
            # format response
            formatted_result = {
                "restaurants": {}
            }
            
            for restaurant, meals in top_meals.items():
                formatted_result["restaurants"][restaurant] = [
                    {
                        "rank": meal["rank"],
                        "rmse": meal["rmse"],
                        "avg_utilization": meal["avg_utilization"],
                        "utilization": meal["utilization"],
                        "meal": meal["meal_option"]
                    }
                    for meal in meals
                ]
            
            return JsonResponse(formatted_result)
        else:
            # get top meals overall
            top_meals = get_top_ranked_meals(
                calorie_limit, protein_limit, carb_limit, fat_limit, top_n
            )
            
            # format response
            formatted_result = {
                "count": len(top_meals),
                "ranked_meals": [
                    {
                        "rank": meal["rank"],
                        "rmse": meal["rmse"],
                        "avg_utilization": meal["avg_utilization"],
                        "utilization": meal["utilization"],
                        "meal": meal["meal_option"]
                    }
                    for meal in top_meals
                ]
            }
            
            return JsonResponse(formatted_result)
            
    except Exception as e:
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
        return JsonResponse({
            "error": str(e)
        }, status=500)