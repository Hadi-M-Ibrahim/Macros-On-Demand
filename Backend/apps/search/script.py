from itertools import combinations
from django.conf import settings
from djongo import models
from pymongo import MongoClient


"""
Example format of a valid meal option 
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

def check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit):
    # Get database connection
    collection = get_db_connection()
    if collection is None:
        return []
    
    # Query all food items - including restaurant info
    all_items = list(collection.find({}, {
        "id": 1,
        "item_name": 1,
        "food_category": 1, 
        "restaurant": 1, 
        "calories": 1, 
        "protein": 1, 
        "carbohydrates": 1, 
        "fats": 1
    }))
    
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
    
    # Process each restaurant separately
    for restaurant_name, restaurant_items in restaurants.items():
        # Group items by category for this restaurant
        entrees = [item for item in restaurant_items if item.get("food_category") in ["Sandwiches", "Entrees", "Pizza", "Burgers"]]
        sides = [item for item in restaurant_items if item.get("food_category") in ["Fried Potatoes", "Appetizers & Sides", "Salads", "Soup", "Baked Goods"]]
        desserts = [item for item in restaurant_items if item.get("food_category") == "Desserts"]
        
        # Generate all valid meal combinations for this restaurant
        # First, handle combinations with 0 or 1 or 2 entrees
        for entree_count in range(3):  # 0, 1, or 2 entrees
            entree_combos = list(combinations(entrees, entree_count)) if entree_count > 0 else [()]
            
            # For each entree combination
            for entree_combo in entree_combos:
                # Handle combinations with 0 or 1 or 2 sides
                for side_count in range(3):  # 0, 1, or 2 sides
                    side_combos = list(combinations(sides, side_count)) if side_count > 0 else [()]
                    
                    # For each side combination
                    for side_combo in side_combos:
                        # Handle combinations with 0 or 1 dessert
                        dessert_combos = list(combinations(desserts, 1)) if desserts else [()]
                        dessert_combos.append(())  # Add empty tuple for 0 desserts
                        
                        for dessert_combo in dessert_combos:
                            # Skip completely empty meals
                            if not entree_combo and not side_combo and not dessert_combo:
                                continue
                            
                            # Calculate total macros
                            total_calories = sum(item.get("calories", 0) for item in entree_combo + side_combo + dessert_combo)
                            total_protein = sum(item.get("protein", 0) for item in entree_combo + side_combo + dessert_combo)
                            total_carbs = sum(item.get("carbohydrates", 0) for item in entree_combo + side_combo + dessert_combo)
                            total_fats = sum(item.get("fats", 0) for item in entree_combo + side_combo + dessert_combo)

                            # Check constraints
                            if (total_calories <= calorie_limit and 
                                total_protein <= protein_limit and 
                                total_carbs <= carb_limit and 
                                total_fats <= fat_limit):
                                
                                # Create meal object in the requested format
                                food_item_ids = [str(item.get("id")) for item in entree_combo + side_combo + dessert_combo]
                                
                                meal = {
                                    "restaurant": restaurant_name,
                                    "calories": total_calories,
                                    "protein": total_protein,
                                    "carbs": total_carbs,
                                    "fats": total_fats,
                                    "food_item_ids": food_item_ids
                                }
                                
                                valid_meals.append(meal)

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