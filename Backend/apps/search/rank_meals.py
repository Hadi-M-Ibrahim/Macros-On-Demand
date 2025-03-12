# this script ranks the list of valid meal permutations created from script.py

import math
import time
from .script import check_meal_options

# Simple caching mechanism
ranking_cache = {}

def calculate_rmse(actual, target):
    """
    calculate RMSE between actual values and target values
    look for lower RMSE values --> this means meal's macros are closer to target values
    
    input:
        actual (dict): Dictionary containing actual macro values
        target (dict): Dictionary containing target macro values
        
    output:
        float: RMSE value
    """
    squared_errors = [
        (actual["calories"] - target["calories"]) ** 2,
        (actual["protein"] - target["protein"]) ** 2,
        (actual["carbs"] - target["carbs"]) ** 2,
        (actual["fats"] - target["fats"]) ** 2
    ]
    
    # Calculate mean of squared errors
    mean_squared_error = sum(squared_errors) / len(squared_errors)
    
    # Return square root of mean squared error
    return math.sqrt(mean_squared_error)

def rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit, max_meals=100):
    """
    rank meal options based on how close they are to the target macronutrient values.
    
    input:
        calorie_limit (int): max calories allowed
        protein_limit (int): max protein allowed in grams
        carb_limit (int): max carbohydrates allowed in grams
        fat_limit (int): max fats allowed in grams
        max_meals (int): maximum number of meals to process
        
    output:
        list: sorted list of meal options with ranking information
    """
    # Check cache first
    cache_key = f"{calorie_limit}_{protein_limit}_{carb_limit}_{fat_limit}_{max_meals}"
    if cache_key in ranking_cache:
        return ranking_cache[cache_key]
    
    start_time = time.time()
    
    # Get all valid meal options within the limits (with optimized parameters)
    valid_meals = check_meal_options(
        calorie_limit, 
        protein_limit, 
        carb_limit, 
        fat_limit, 
        max_items=4,  # Maximum 4 items per meal for better efficiency
        limit=max_meals  # Limit the total number of meal options
    )
    
    # Define target values (we want to be as close as possible to these maximums)
    target_macros = {
        "calories": calorie_limit,
        "protein": protein_limit,
        "carbs": carb_limit,
        "fats": fat_limit
    }
    
    # Calculate RMSE for each meal
    ranked_meals = []
    for meal_option in valid_meals:
        meal = meal_option["meal"]
        actual_macros = {
            "calories": meal["calories"],
            "protein": meal["protein"],
            "carbs": meal["carbs"],
            "fats": meal["fats"]
        }
        
        # Calculate percentage utilization for each macro
        utilization = {
            "calories": (meal["calories"] / calorie_limit) * 100 if calorie_limit > 0 else 0,
            "protein": (meal["protein"] / protein_limit) * 100 if protein_limit > 0 else 0,
            "carbs": (meal["carbs"] / carb_limit) * 100 if carb_limit > 0 else 0,
            "fats": (meal["fats"] / fat_limit) * 100 if fat_limit > 0 else 0
        }
        
        # Calculate average utilization
        avg_utilization = sum(utilization.values()) / len(utilization)
        
        # Calculate RMSE
        rmse = calculate_rmse(actual_macros, target_macros)
        
        # Add ranking information to the meal
        ranked_meal = {
            "meal_option": meal_option,
            "rmse": rmse,
            "avg_utilization": avg_utilization,
            "utilization": utilization
        }
        
        ranked_meals.append(ranked_meal)
    
    # Sort meals by RMSE (lower is better)
    ranked_meals.sort(key=lambda x: x["rmse"])
    
    # Add rank to each meal
    for i, meal in enumerate(ranked_meals, 1):
        meal["rank"] = i
    
    print(f"Ranked {len(ranked_meals)} meal options in {time.time() - start_time:.2f} seconds")
    
    # Cache the results
    ranking_cache[cache_key] = ranked_meals
    return ranked_meals