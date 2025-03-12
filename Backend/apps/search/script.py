from itertools import combinations
from django.conf import settings
import time
from bson import ObjectId
from pymongo import MongoClient
import random

"""
Example format of a valid meal option 
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
"""

# MongoDB configuration
def get_db_connection():
    try:
        client = MongoClient(settings.DATABASES["default"]["CLIENT"]["host"])
        db = client["MODdb"]
        collection = db["meals_fooditem"]
        return collection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# caching mechanism
meal_options_cache = {}

def check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit, max_items=5, limit=100):
    """
    Generate valid meal combinations within given macro limits.
    
    Args:
        calorie_limit (int): Maximum calories allowed
        protein_limit (int): Maximum protein (g) allowed
        carb_limit (int): Maximum carbs (g) allowed
        fat_limit (int): Maximum fat (g) allowed
        max_items (int): Maximum items in a meal
        limit (int): Maximum number of meal options to return
        
    Returns:
        list: Valid meal options within the given constraints
    """
    # Check cache first
    cache_key = f"{calorie_limit}_{protein_limit}_{carb_limit}_{fat_limit}_{max_items}_{limit}"
    if cache_key in meal_options_cache:
        return meal_options_cache[cache_key]
    
    start_time = time.time()
    
    # Get database connection
    collection = get_db_connection()
    if collection is None:
        return []
    
    # Apply pre-filtering at database level to get fewer items to process
    # Only get items that have calories <= calorie_limit (significant reduction)
    query = {
        "calories": {"$lte": calorie_limit},
        "protein": {"$lte": protein_limit},
        "carbohydrates": {"$lte": carb_limit}, 
        "fats": {"$lte": fat_limit}
    }
    
    projection = {
        "id": 1, 
        "item_name": 1,
        "food_category": 1, 
        "restaurant": 1, 
        "calories": 1, 
        "protein": 1, 
        "carbohydrates": 1, 
        "fats": 1
    }
    
    all_items = list(collection.find(query, projection))
    
    # Filter out beverage and toppings/ingredients categories
    excluded_categories = ["Beverages", "Toppings & Ingredients"]
    filtered_items = [item for item in all_items if item.get("food_category") not in excluded_categories]
    
    # Group items by restaurant first
    restaurants = {}
    for item in filtered_items:
        restaurant_name = item.get("restaurant")
        if not restaurant_name:
            continue
            
        if restaurant_name not in restaurants:
            restaurants[restaurant_name] = []
        restaurants[restaurant_name].append(item)
    
    valid_meals = []
    
    # if we have too many restaurants randomly sample to improve performance
    if len(restaurants) > 10:
        restaurant_names = list(restaurants.keys())
        random.shuffle(restaurant_names)
        restaurant_names = restaurant_names[:10]  # Limit to 10 restaurants
        restaurants = {name: restaurants[name] for name in restaurant_names}
    
    # Process each restaurant separately
    for restaurant_name, restaurant_items in restaurants.items():
        # Group items by category for this restaurant
        entrees = [item for item in restaurant_items if item.get("food_category") in ["Sandwiches", "Entrees", "Pizza", "Burgers"]]
        sides = [item for item in restaurant_items if item.get("food_category") in ["Fried Potatoes", "Appetizers & Sides", "Salads", "Soup", "Baked Goods"]]
        desserts = [item for item in restaurant_items if item.get("food_category") == "Desserts"]
        
        # Limit the size of each category to improve performance
        if len(entrees) > 5: 
            random.shuffle(entrees)
            entrees = entrees[:5]
            
        if len(sides) > 5:
            random.shuffle(sides)
            sides = sides[:5]
            
        if len(desserts) > 3:
            random.shuffle(desserts)
            desserts = desserts[:3]
        
        # Generate all valid meal combinations for this restaurant with limited items per meal
        # First, handle combinations with 0 or 1 or 2 entrees
        for entree_count in range(min(len(entrees) + 1, 3)):  # 0, 1, or 2 entrees or max available
            entree_combos = list(combinations(entrees, entree_count)) if entree_count > 0 else [()]
            
            # For each entree combination
            for entree_combo in entree_combos:
                # Check if we've reached our meal limit
                if len(valid_meals) >= limit:
                    meal_options_cache[cache_key] = valid_meals
                    return valid_meals
                
                # Maximum remaining items possible
                max_remaining = max_items - len(entree_combo)
                if max_remaining <= 0:
                    continue
                
                # Handle combinations with 0 or 1 or 2 sides, limited by max_remaining
                for side_count in range(min(len(sides) + 1, 3, max_remaining + 1)):
                    side_combos = list(combinations(sides, side_count)) if side_count > 0 else [()]
                    
                    # For each side combination
                    for side_combo in side_combos:
                        # Check if we've reached our meal limit
                        if len(valid_meals) >= limit:
                            meal_options_cache[cache_key] = valid_meals
                            return valid_meals
                        
                        # Maximum remaining items after adding sides
                        max_remaining = max_items - len(entree_combo) - len(side_combo)
                        if max_remaining <= 0:
                            continue
                        
                        # Handle combinations with 0 or 1 dessert, limited by max_remaining
                        if max_remaining >= 1 and desserts:
                            dessert_combos = [(), (desserts[0],)]  # Either 0 or 1 dessert
                        else:
                            dessert_combos = [()]  # No desserts
                        
                        for dessert_combo in dessert_combos:
                            # Skip completely empty meals
                            if not entree_combo and not side_combo and not dessert_combo:
                                continue
                            
                            # Quickly check if total items exceed max_items
                            total_items = len(entree_combo) + len(side_combo) + len(dessert_combo)
                            if total_items > max_items:
                                continue
                            
                            # Calculate total macros
                            total_calories = sum(item.get("calories", 0) for item in entree_combo + side_combo + dessert_combo)
                            
                            # Quick check on calories before calculating other macros
                            if total_calories > calorie_limit:
                                continue
                                
                            total_protein = sum(item.get("protein", 0) for item in entree_combo + side_combo + dessert_combo)
                            
                            # Quick check on protein before calculating other macros
                            if total_protein > protein_limit:
                                continue
                                
                            total_carbs = sum(item.get("carbohydrates", 0) for item in entree_combo + side_combo + dessert_combo)
                            
                            # Quick check on carbs before calculating fat
                            if total_carbs > carb_limit:
                                continue
                                
                            total_fats = sum(item.get("fats", 0) for item in entree_combo + side_combo + dessert_combo)

                            # Final check with all macros
                            if (total_calories <= calorie_limit and 
                                total_protein <= protein_limit and 
                                total_carbs <= carb_limit and 
                                total_fats <= fat_limit):
                                
                                # Create meal object in the requested format
                                food_item_ids = [str(item.get("id")) for item in entree_combo + side_combo + dessert_combo]
                                
                                meal = {
                                    "message": "Meal option generated successfully.",
                                    "meal": {
                                        "restaurant": restaurant_name,
                                        "calories": total_calories,
                                        "protein": total_protein,
                                        "carbs": total_carbs,
                                        "fats": total_fats,
                                        "food_item_ids": food_item_ids
                                    }
                                }
                                
                                valid_meals.append(meal)
                            
                            # Check if we've reached our meal limit
                            if len(valid_meals) >= limit:
                                break
    
    # Cache the results
    print(f"Generated {len(valid_meals)} meal options in {time.time() - start_time:.2f} seconds")
    
    # If we didn't find enough meals, try with relaxed constraints
    if len(valid_meals) < 10 and max_items < 5:
        return check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit, max_items + 1, limit)
    
    meal_options_cache[cache_key] = valid_meals
    return valid_meals

def save_meal_to_db(meal_data):
    """
    Saves a meal to the database
    
    Args:
        meal_data (dict): Meal data including food_item_ids, macros, etc.
    
    Returns:
        dict: Response with meal ID and status message
    """
    try:
        client = MongoClient(settings.DATABASES["default"]["CLIENT"]["host"])
        db = client["MODdb"]
        meals_collection = db["meals_meal"]
        
        # Insert meal into database
        result = meals_collection.insert_one(meal_data)
        meal_id = str(result.inserted_id)
        
        return {
            "message": "Meal saved successfully.",
            "meal": {
                "id": meal_id,
                **meal_data
            }
        }
    except Exception as e:
        return {
            "message": f"Error saving meal: {str(e)}",
            "error": True
        }