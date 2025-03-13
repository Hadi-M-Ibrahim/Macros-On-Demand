from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from .script import check_meal_options, save_meal_to_db
from .rank_meals import rank_meal_options, get_top_ranked_meals, get_top_ranked_meals_by_restaurant

logger = logging.getLogger(__name__)

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
        
        # Get flexibility parameter (default to false for backward compatibility)
        protein_flexible = request.GET.get("protein_flexible", "false").lower() == "true"

        # Call the function from script.py to generate valid meal options
        valid_meals = check_meal_options(
            calorie_limit, 
            protein_limit, 
            carb_limit, 
            fat_limit, 
            protein_flexibility=protein_flexible
        )

        return JsonResponse({
            "count": len(valid_meals),
            "valid_meals": valid_meals
        })
    except Exception as e:
        logger.error(f"Error in meal_options_view: {str(e)}")
        return JsonResponse({
            "error": str(e)
        }, status=400)

@require_http_methods(["GET"])
def ranked_meal_options_view(request):
    """
    View function to get ranked meal options based on how close they are to the specified limits
    """
    try:
        # Get user-defined macronutrient constraints from query parameters
        calorie_limit = int(request.GET.get("calories", 800))
        protein_limit = int(request.GET.get("protein", 50))
        carb_limit = int(request.GET.get("carbs", 100))
        fat_limit = int(request.GET.get("fats", 30))
        
        # Optional parameters
        top_n = int(request.GET.get("top_n", 10))
        by_restaurant = request.GET.get("by_restaurant", "false").lower() == "true"
        top_n_per_restaurant = int(request.GET.get("top_n_per_restaurant", 3))
        
        # Flexibility and protein bonus options
        protein_bonus = request.GET.get("protein_bonus", "true").lower() == "true"
        protein_flexibility = request.GET.get("protein_flexible", "false").lower() == "true"
        
        if by_restaurant:
            # Get top meals by restaurant
            top_meals = get_top_ranked_meals_by_restaurant(
                calorie_limit, 
                protein_limit, 
                carb_limit, 
                fat_limit, 
                top_n_per_restaurant,
                protein_bonus=protein_bonus,
                protein_flexibility=protein_flexibility
            )
            
            # Format response
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
                        "meal": meal["meal"]
                    }
                    for meal in meals
                ]
            
            return JsonResponse(formatted_result)
        else:
            # Get top meals overall
            top_meals = get_top_ranked_meals(
                calorie_limit, 
                protein_limit, 
                carb_limit, 
                fat_limit, 
                top_n,
                protein_bonus=protein_bonus,
                protein_flexibility=protein_flexibility
            )
            
            # Format response
            formatted_result = {
                "count": len(top_meals),
                "ranked_meals": [
                    {
                        "rank": meal["rank"],
                        "rmse": meal["rmse"],
                        "avg_utilization": meal["avg_utilization"],
                        "utilization": meal["utilization"],
                        "meal": meal["meal"]
                    }
                    for meal in top_meals
                ]
            }
            
            return JsonResponse(formatted_result)
            
    except Exception as e:
        logger.error(f"Error in ranked_meal_options_view: {str(e)}")
        return JsonResponse({
            "error": str(e)
        }, status=400)

@require_http_methods(["GET"])
def flexible_meal_options_view(request):
    """
    View function to get meal options with flexible protein handling
    """
    try:
        # Get user-defined macronutrient constraints
        calorie_limit = int(request.GET.get("calories", 800))
        protein_limit = int(request.GET.get("protein", 50))
        carb_limit = int(request.GET.get("carbs", 100))
        fat_limit = int(request.GET.get("fats", 30))
        
        # Get flexibility parameter (default to true for this endpoint)
        protein_flexible = request.GET.get("protein_flexible", "true").lower() == "true"

        # Call function with flexibility parameter
        valid_meals = check_meal_options(
            calorie_limit, 
            protein_limit, 
            carb_limit, 
            fat_limit,
            protein_flexibility=protein_flexible
        )

        return JsonResponse({
            "count": len(valid_meals),
            "valid_meals": valid_meals
        })
    except Exception as e:
        logger.error(f"Error in flexible_meal_options_view: {str(e)}")
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
        required_fields = ["restaurant", "food_item_ids", "calories", "protein", "carbs", "fats"]
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    "error": f"Missing required field: {field}"
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
        logger.error(f"Error in save_meal_view: {str(e)}")
        return JsonResponse({
            "error": str(e)
        }, status=500)