from itertools import combinations
from django.conf import settings
from djongo import models
from pymongo import MongoClient
from functools import lru_cache
import time
import hashlib
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

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
        logger.error(f"Error connecting to database: {e}")
        return None

# create cache key from the macro parameters
def get_cache_key(calorie_limit, protein_limit, carb_limit, fat_limit):
    params = f"{calorie_limit}_{protein_limit}_{carb_limit}_{fat_limit}"
    return hashlib.md5(params.encode()).hexdigest()

#dictionary cache for storing meal options
_meal_options_cache = {}

# LRU cache for function memoization
@lru_cache(maxsize=100)
def cached_meal_options(cache_key):
    """Return cached meal options for the given cache key."""
    return _meal_options_cache.get(cache_key, [])

def store_in_cache(cache_key, results):
    """Store meal options in cache."""
    _meal_options_cache[cache_key] = results
    # refresh the LRU cache entry if needed
    cached_meal_options.cache_clear()

def check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit):
    """
    Optimized version of the meal options algorithm that:
    1. Pre-filters items that exceed constraints, except for protein which can exceed limits
    2. Uses early termination for combinations that will definitely exceed limits
    3. Caches partial combinations to avoid redundant calculations
    4. Implements caching for repeated searches
    """
    start_time = time.time()
    
    # generate cache key
    cache_key = get_cache_key(calorie_limit, protein_limit, carb_limit, fat_limit)
    
    # try to get from cache first
    try:
        # Try in-memory cache first
        cached_results = cached_meal_options(cache_key)
        if cached_results:
            logger.info(f"Retrieved results from in-memory cache for key: {cache_key}")
            return cached_results
            
        # then try database cache if using MongoDB for caching
        collection = get_db_connection()
        if collection:
            cache_collection = collection.database["search_cache"]
            cached_result = cache_collection.find_one({"key": cache_key})
            
            if cached_result:
                logger.info(f"Retrieved results from database cache for key: {cache_key}")
                # Store in in-memory cache for faster future access
                store_in_cache(cache_key, cached_result["results"])
                return cached_result["results"]
    except Exception as e:
        logger.error(f"Cache retrieval error: {e}")
    
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
    
    # OPTIMIZATION 1: Pre-filter items - allow any protein level
    filtered_items = [
        item for item in all_items 
        if item.get("food_category") not in excluded_categories
        and item.get("calories", 0) <= calorie_limit
        and item.get("carbohydrates", 0) <= carb_limit
        and item.get("fats", 0) <= fat_limit
    ]
    
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
    
    # Cache for macro sums to avoid recalculating the same combinations
    @lru_cache(maxsize=10000)
    def get_macro_sums(item_ids_tuple):
        # Calculate the sum of macros for a given combination of items
        items = tuple(item for item in filtered_items if str(item.get("id")) in item_ids_tuple)
        return (
            sum(item.get("calories", 0) for item in items),
            sum(item.get("protein", 0) for item in items),
            sum(item.get("carbohydrates", 0) for item in items),
            sum(item.get("fats", 0) for item in items)
        )
    
    # Process each restaurant separately
    for restaurant_name, restaurant_items in restaurants.items():
        # Group items by category for this restaurant
        entrees = [item for item in restaurant_items if item.get("food_category") in ["Sandwiches", "Entrees", "Pizza", "Burgers"]]
        sides = [item for item in restaurant_items if item.get("food_category") in ["Fried Potatoes", "Appetizers & Sides", "Salads", "Soup", "Baked Goods"]]
        desserts = [item for item in restaurant_items if item.get("food_category") == "Desserts"]
        
        # OPTIMIZATION 2: Sort items within each category by calorie density (calories per gram of macronutrients)
        # This prioritizes more macro-efficient foods when early-terminating combinations
        def calorie_density(item):
            total_macros = item.get("protein", 0) + item.get("carbohydrates", 0) + item.get("fats", 0)
            if total_macros > 0:
                return item.get("calories", 0) / total_macros
            return float('inf')
        
        entrees.sort(key=calorie_density)
        sides.sort(key=calorie_density)
        desserts.sort(key=calorie_density)
        
        # Generate valid entree combinations (0, 1, or 2 entrees)
        entree_combinations = [()]  # Start with empty combo
        if entrees:
            entree_combinations.extend([(item,) for item in entrees])  # Add single entree combos
            
            # Only generate 2-entree combos if individual entrees are within limits
            valid_two_entree_combos = []
            for i, e1 in enumerate(entrees):
                for e2 in entrees[i+1:]:
                    # Calculate combined macros
                    cal = e1.get("calories", 0) + e2.get("calories", 0)
                    carb = e1.get("carbohydrates", 0) + e2.get("carbohydrates", 0)
                    fat = e1.get("fats", 0) + e2.get("fats", 0)
                    
                    # Early termination if this combo already exceeds any limit
                    # (no protein check)
                    if (cal <= calorie_limit and 
                        carb <= carb_limit and 
                        fat <= fat_limit):
                        valid_two_entree_combos.append((e1, e2))
            
            entree_combinations.extend(valid_two_entree_combos)
        
        # Generate valid side combinations (0, 1, or 2 sides) using same approach
        side_combinations = [()]
        if sides:
            side_combinations.extend([(item,) for item in sides])
            
            valid_two_side_combos = []
            for i, s1 in enumerate(sides):
                for s2 in sides[i+1:]:
                    cal = s1.get("calories", 0) + s2.get("calories", 0)
                    carb = s1.get("carbohydrates", 0) + s2.get("carbohydrates", 0)
                    fat = s1.get("fats", 0) + s2.get("fats", 0)
                    
                    # No protein check
                    if (cal <= calorie_limit and 
                        carb <= carb_limit and 
                        fat <= fat_limit):
                        valid_two_side_combos.append((s1, s2))
            
            side_combinations.extend(valid_two_side_combos)
        
        # Generate dessert combinations (0 or 1 dessert)
        dessert_combinations = [()]
        dessert_combinations.extend([(d,) for d in desserts])
        
        # OPTIMIZATION 3: Combine the components using pre-filtered valid combinations
        for entree_combo in entree_combinations:
            # Calculate macro totals for this entree combo
            entree_calories = sum(item.get("calories", 0) for item in entree_combo)
            entree_protein = sum(item.get("protein", 0) for item in entree_combo)
            entree_carbs = sum(item.get("carbohydrates", 0) for item in entree_combo)
            entree_fats = sum(item.get("fats", 0) for item in entree_combo)
            
            # Calculate remaining limits - no protein check
            remaining_calories = calorie_limit - entree_calories
            remaining_carbs = carb_limit - entree_carbs
            remaining_fats = fat_limit - entree_fats
            
            # Skip if already over limits
            if (remaining_calories < 0 or
                remaining_carbs < 0 or 
                remaining_fats < 0):
                continue
            
            for side_combo in side_combinations:
                # Calculate macro totals for this side combo
                side_calories = sum(item.get("calories", 0) for item in side_combo)
                side_protein = sum(item.get("protein", 0) for item in side_combo)
                side_carbs = sum(item.get("carbohydrates", 0) for item in side_combo)
                side_fats = sum(item.get("fats", 0) for item in side_combo)

                # Calculate remaining limits after adding sides - no protein check
                remaining_calories_after_sides = remaining_calories - side_calories
                remaining_carbs_after_sides = remaining_carbs - side_carbs
                remaining_fats_after_sides = remaining_fats - side_fats
                
                # Skip if over limits
                if (remaining_calories_after_sides < 0 or
                    remaining_carbs_after_sides < 0 or 
                    remaining_fats_after_sides < 0):
                    continue
                
                for dessert_combo in dessert_combinations:
                    # Skip completely empty meals
                    if not entree_combo and not side_combo and not dessert_combo:
                        continue
                    
                    # Calculate dessert macro totals
                    dessert_calories = sum(item.get("calories", 0) for item in dessert_combo)
                    dessert_protein = sum(item.get("protein", 0) for item in dessert_combo)
                    dessert_carbs = sum(item.get("carbohydrates", 0) for item in dessert_combo)
                    dessert_fats = sum(item.get("fats", 0) for item in dessert_combo)

                    # Final check against limits - no protein check
                    total_calories = entree_calories + side_calories + dessert_calories
                    total_protein = entree_protein + side_protein + dessert_protein
                    total_carbs = entree_carbs + side_carbs + dessert_carbs
                    total_fats = entree_fats + side_fats + dessert_fats
                    
                    if (total_calories <= calorie_limit and 
                        total_carbs <= carb_limit and 
                        total_fats <= fat_limit):
                        
                        # Create meal object in the requested format
                        all_items = entree_combo + side_combo + dessert_combo
                        food_item_ids = [str(item.get("id")) for item in all_items]
                        item_names = [str(item.get("item_name")) for item in all_items]

                        meal = {
                            "restaurant": restaurant_name,
                            "calories": total_calories,
                            "protein": total_protein,
                            "carbs": total_carbs,
                            "fats": total_fats,
                            "food_item_ids": food_item_ids,
                            "item_names" : item_names
                        }
                        
                        valid_meals.append(meal)
    
    end_time = time.time()
    execution_time = end_time - start_time
    logger.info(f"Generated {len(valid_meals)} meal options in {execution_time:.2f} seconds")
    logger.info(f"Parameters: cal={calorie_limit}, prot={protein_limit}, carbs={carb_limit}, fat={fat_limit}")
    
    # Store results in cache
    try:
        # Store in memory cache
        store_in_cache(cache_key, valid_meals)
        
        # Store in database cache
        if collection:
            cache_collection = collection.database["search_cache"]
            cache_collection.update_one(
                {"key": cache_key},
                {"$set": {"results": valid_meals, "created_at": datetime.now()}},
                upsert=True
            )
            logger.info(f"Stored results in database cache with key: {cache_key}")
    except Exception as e:
        logger.error(f"Cache storage error: {e}")
    
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