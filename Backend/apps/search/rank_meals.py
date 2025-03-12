import math
from script import check_meal_options

def calculate_rmse(actual, target):
    """
    Calculate Root Mean Square Error between actual values and target values.
    Lower RMSE means the meal's macros are closer to the target values.
    
    Args:
        actual (dict): Dictionary containing actual macro values
        target (dict): Dictionary containing target macro values
        
    Returns:
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

def rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit):
    """
    Rank meal options based on how close they are to the target macronutrient values.
    
    Args:
        calorie_limit (int): Maximum calories allowed
        protein_limit (int): Maximum protein allowed in grams
        carb_limit (int): Maximum carbohydrates allowed in grams
        fat_limit (int): Maximum fats allowed in grams
        
    Returns:
        list: Sorted list of meal options with ranking information
    """
    # Get all valid meal options within the limits
    valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
    
    # Define target values (we want to be as close as possible to these maximums)
    target_macros = {
        "calories": calorie_limit,
        "protein": protein_limit,
        "carbs": carb_limit,
        "fats": fat_limit
    }
    
    # Calculate RMSE for each meal
    ranked_meals = []
    for meal in valid_meals:
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
            "meal": meal,
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
    
    return ranked_meals

def get_top_ranked_meals(calorie_limit, protein_limit, carb_limit, fat_limit, top_n=10):
    """
    Get the top N ranked meal options.
    
    Args:
        calorie_limit (int): Maximum calories allowed
        protein_limit (int): Maximum protein allowed in grams
        carb_limit (int): Maximum carbohydrates allowed in grams
        fat_limit (int): Maximum fats allowed in grams
        top_n (int): Number of top meals to return
        
    Returns:
        list: Top N ranked meal options
    """
    ranked_meals = rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
    return ranked_meals[:min(top_n, len(ranked_meals))]

def get_top_ranked_meals_by_restaurant(calorie_limit, protein_limit, carb_limit, fat_limit, top_n_per_restaurant=3):
    """
    Get the top N ranked meal options for each restaurant.
    
    Args:
        calorie_limit (int): Maximum calories allowed
        protein_limit (int): Maximum protein allowed in grams
        carb_limit (int): Maximum carbohydrates allowed in grams
        fat_limit (int): Maximum fats allowed in grams
        top_n_per_restaurant (int): Number of top meals to return per restaurant
        
    Returns:
        dict: Dictionary mapping restaurant names to lists of their top N ranked meal options
    """
    ranked_meals = rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
    
    # Group meals by restaurant
    meals_by_restaurant = {}
    for meal in ranked_meals:
        restaurant = meal["meal"]["restaurant"]
        if restaurant not in meals_by_restaurant:
            meals_by_restaurant[restaurant] = []
        meals_by_restaurant[restaurant].append(meal)
    
    # Get top N for each restaurant
    top_meals_by_restaurant = {}
    for restaurant, meals in meals_by_restaurant.items():
        top_meals_by_restaurant[restaurant] = meals[:min(top_n_per_restaurant, len(meals))]
    
    return top_meals_by_restaurant

if __name__ == "__main__":
    # Example usage
    calorie_limit = 800
    protein_limit = 50
    carb_limit = 100
    fat_limit = 30
    
    # Get top 10 meals overall
    top_meals = get_top_ranked_meals(calorie_limit, protein_limit, carb_limit, fat_limit)
    
    print(f"Top 10 Ranked Meals (Target: {calorie_limit} cal, {protein_limit}g protein, {carb_limit}g carbs, {fat_limit}g fats)")
    for meal in top_meals:
        m = meal["meal"]
        print(f"Rank {meal['rank']} - RMSE: {meal['rmse']:.2f} - Utilization: {meal['avg_utilization']:.1f}%")
        print(f"  Restaurant: {m['restaurant']}")
        print(f"  Macros: {m['calories']} cal ({meal['utilization']['calories']:.1f}%), " +
              f"{m['protein']}g protein ({meal['utilization']['protein']:.1f}%), " +
              f"{m['carbs']}g carbs ({meal['utilization']['carbs']:.1f}%), " +
              f"{m['fats']}g fats ({meal['utilization']['fats']:.1f}%)")
        print(f"  Food IDs: {', '.join(m['food_item_ids'])}")
        print()