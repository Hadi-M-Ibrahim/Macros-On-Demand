import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import json
import sys
import os
import math
import random

# Add the parent directory to sys.path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the functions to test
from script import check_meal_options
from rank_meals import calculate_rmse, rank_meal_options, get_top_ranked_meals

class TestMealRankings(unittest.TestCase):
    """Test cases for the meal ranking algorithm"""

    def setUp(self):
        """Set up test data with realistic food items across various restaurants"""
        # Define restaurants and their food categories
        restaurants = [
            "McDonald's", "Burger King", "KFC", "Wendy's", "Taco Bell",
            "Subway", "Pizza Hut", "Chick-fil-A", "Dunkin' Donuts", "Starbucks",
            "Chipotle", "Church's Chicken", "Culver's", "Dairy Queen", "Del Taco",
            "Denny's", "Dickey's Barbeque", "Domino's", "Einstein Bros", "El Pollo Loco",
            "Famous Dave's", "Five Guys", "Hardee's", "IHOP", "In-N-Out", "Jack in the Box",
            "Jamba Juice", "Jimmy John's", "Krispy Kreme", "Little Caesar's", "Long John Silver's",
            "Moe's Southwest Grill", "Olive Garden", "Outback Steakhouse", "Panda Express",
            "Panera Bread", "Papa John's", "Papa Murphy's", "Popeyes", "Portillo's", "Qdoba",
            "Quiznos", "Raising Cane's Chicken Fingers", "Red Lobster", "Red Robin",
            "Round Table Pizza", "Sbarro", "Shake Shack", "Sonic", "TGI Friday's",
            "The Cheesecake Factory", "Tropical Smoothie Café", "Whataburger",
            "White Castle", "Wingstop", "Zaxby's"
        ]

        
        # Define food categories for each restaurant
        entree_categories = ["Burgers", "Sandwiches", "Entrees", "Pizza"]
        side_categories = ["Fried Potatoes", "Appetizers & Sides", "Salads", "Soup", "Baked Goods"]
        dessert_categories = ["Desserts"]
        
        # Initialize empty lists for each restaurant
        self.all_items = []
        self.items_by_restaurant = {restaurant: [] for restaurant in restaurants}
        
        # Set seed for reproducibility
        random.seed(42)
        
        # ID counter
        id_counter = 1
        
        # Helper function to generate a food item with realistic macros
        def generate_food_item(restaurant, category_type, idx):
            nonlocal id_counter
            
            # Select a category based on the type
            if category_type == "entree":
                category = random.choice(entree_categories)
                # Entrees have higher calories and protein
                name = str(idx)
                calories = random.randint(300, 700)
                protein = random.randint(15, 35)
                carbs = random.randint(20, 50)
                fats = random.randint(10, 30)
            elif category_type == "side":
                category = random.choice(side_categories)
                # Sides have moderate calories and more carbs
                name = str(idx)
                calories = random.randint(100, 400)
                protein = random.randint(2, 10)
                carbs = random.randint(20, 60)
                fats = random.randint(5, 20)
            elif category_type == "dessert":
                category = "Desserts"
                # Desserts have moderate calories, high carbs, low protein
                name = str(idx)
                calories = random.randint(200, 500)
                protein = random.randint(1, 8)
                carbs = random.randint(30, 70)
                fats = random.randint(8, 25)
            
            # Generate item with unique ID
            item = {
                "id": ObjectId(),
                "item_name": name,
                "restaurant": restaurant,
                "food_category": category,
                "calories": calories,
                "protein": protein,
                "carbohydrates": carbs,
                "fats": fats
            }
            
            id_counter += 1
            return item
        
        # Generate items for each restaurant
        for restaurant in restaurants:
            # Generate 20 entrees, 20 sides, and 10 desserts for each restaurant
            for i in range(40):
                entree = generate_food_item(restaurant, "entree", i+1)
                self.items_by_restaurant[restaurant].append(entree)
                self.all_items.append(entree)
                
                side = generate_food_item(restaurant, "side", i+1)
                self.items_by_restaurant[restaurant].append(side)
                self.all_items.append(side)
                
                if i < 10:
                    dessert = generate_food_item(restaurant, "dessert", i+1)
                    self.items_by_restaurant[restaurant].append(dessert)
                    self.all_items.append(dessert)

    def test_calculate_rmse(self):
        """Test RMSE calculation"""
        actual = {"calories": 750, "protein": 40, "carbs": 80, "fats": 25}
        target = {"calories": 800, "protein": 50, "carbs": 100, "fats": 30}
        
        # Calculate expected RMSE manually
        squared_errors = [
            (750 - 800) ** 2,
            (40 - 50) ** 2,
            (80 - 100) ** 2,
            (25 - 30) ** 2
        ]
        expected_rmse = math.sqrt(sum(squared_errors) / 4)
        
        # Test the function
        calculated_rmse = calculate_rmse(actual, target)
        
        # Check if the calculated RMSE matches the expected RMSE
        self.assertAlmostEqual(calculated_rmse, expected_rmse, places=5)

    @patch('script.get_db_connection')
    def test_meal_ranking_order(self, mock_get_db):
        """Test that meals are ranked correctly by RMSE"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Set limits that allow for multiple restaurants to have valid meals
        calorie_limit = 1000
        protein_limit = 50
        carb_limit = 100
        fat_limit = 50
        
        # Get ranked meals
        ranked_meals = rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        # Check that meals are ordered by RMSE (ascending)
        for i in range(1, len(ranked_meals)):
            self.assertLessEqual(
                ranked_meals[i-1]["rmse"],
                ranked_meals[i]["rmse"],
                "Meals should be ordered by RMSE in ascending order"
            )
    
    @patch('script.get_db_connection')
    def test_top_meals_count(self, mock_get_db):
        """Test that get_top_ranked_meals returns the correct number of meals"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Set limits
        calorie_limit = 1000
        protein_limit = 50
        carb_limit = 100
        fat_limit = 50
        
        # Get top 5 meals
        top_meals = get_top_ranked_meals(calorie_limit, protein_limit, carb_limit, fat_limit, top_n=5)
        
        # Check that we get at most 5 meals
        self.assertLessEqual(len(top_meals), 5, "Should return at most 5 meals")
        
        # If there are at least 5 valid meals, check that we get exactly 5
        all_valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        if len(all_valid_meals) >= 5:
            self.assertEqual(len(top_meals), 5, "Should return exactly 5 meals when available")
    
    @patch('script.get_db_connection')
    def test_multiple_restaurants(self, mock_get_db):
        """Test that meals from multiple restaurants are generated"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Set limits that should allow meals from multiple restaurants
        calorie_limit = 1000
        protein_limit = 50
        carb_limit = 100
        fat_limit = 50
        
        # Get meal options
        meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        # Check that we get meals from at least 3 different restaurants
        restaurants = set(meal["restaurant"] for meal in meals)
        self.assertGreaterEqual(len(restaurants), 3, 
                               f"Should get meals from at least 3 restaurants, got {len(restaurants)}: {restaurants}")

def print_ranked_meal_permutations():
    """Run the algorithm with test data and print the ranked meal permutations"""
    print("\n=== RANKED MEAL PERMUTATIONS ===\n")
    
    # Create test instance to access test data
    test_instance = TestMealRankings()
    test_instance.setUp()
    
    # Mock the database connection
    mock_collection = MagicMock()
    mock_collection.find.return_value = test_instance.all_items
    
    # Set test limits
    calorie_limit = 1000
    protein_limit = 50
    carb_limit = 100
    fat_limit = 50
    
    print(f"Target: Calories={calorie_limit}, Protein={protein_limit}g, Carbs={carb_limit}g, Fats={fat_limit}g\n")
    
    # Use patch as context manager to mock the database
    with patch('script.get_db_connection', return_value=mock_collection):
        # Measure execution time
        import time
        start_time = time.time()
        
        # Get ranked meals
        ranked_meals = rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        execution_time = time.time() - start_time
        
        # Print results
        if not ranked_meals:
            print("No valid meal permutations found with the given constraints.")
        else:
            print(f"Found {len(ranked_meals)} valid meal permutations in {execution_time:.2f} seconds, ranked by RMSE:\n")
            
            # Group meals by restaurant for easier reading
            meals_by_restaurant = {}
            for meal in ranked_meals[:100]:  # Limit to top 100 for readability
                restaurant = meal["meal"]["restaurant"]
                if restaurant not in meals_by_restaurant:
                    meals_by_restaurant[restaurant] = []
                meals_by_restaurant[restaurant].append(meal)
            
            # Print number of meals from each restaurant
            print("Number of meals by restaurant:")
            for restaurant, meals in meals_by_restaurant.items():
                print(f"- {restaurant}: {len(meals)} meals")
            
            print("\nSample of top meals from each restaurant:")
            
            # Print top 3 ranked meals from each restaurant
            for restaurant, meals in meals_by_restaurant.items():
                print(f"\n=== {restaurant} (showing top 3 of {len(meals)} meals) ===")
                
                for meal in meals[:3]:  # Just show top 3 per restaurant
                    m = meal["meal"]
                    
                    # Get food item details
                    food_items = []
                    for item_id in m["food_item_ids"]:
                        for item in test_instance.all_items:
                            if str(item["id"]) == item_id:
                                food_items.append(item)
                                break
                    
                    # Format food items by category
                    items_str = ", ".join([item["item_name"] for item in food_items])
                    
                    print(f"\nRank {meal['rank']} (RMSE: {meal['rmse']:.2f}, Util: {meal['avg_utilization']:.1f}%):")
                    print(f"  Foods: {items_str}")
                    print(f"  Macros: {m['calories']} cal, {m['protein']}g protein, "
                          f"{m['carbs']}g carbs, {m['fats']}g fats")
                    print(f"  Utilization: Cal: {meal['utilization']['calories']:.1f}%, Protein: {meal['utilization']['protein']:.1f}%, "
                          f"Carbs: {meal['utilization']['carbs']:.1f}%, Fats: {meal['utilization']['fats']:.1f}%")

def debug_item_distribution():
    """Debug function to analyze the distribution of items and their macros"""
    test_instance = TestMealRankings()
    test_instance.setUp()
    
    # Count items per restaurant and category
    restaurant_stats = {}
    
    for restaurant in set(item["restaurant"] for item in test_instance.all_items):
        restaurant_items = [item for item in test_instance.all_items if item["restaurant"] == restaurant]
        
        # Count by category
        category_counts = {}
        for item in restaurant_items:
            category = item["food_category"]
            if category not in category_counts:
                category_counts[category] = 0
            category_counts[category] += 1
        
        # Calculate macro ranges
        calories_range = (
            min(item["calories"] for item in restaurant_items),
            max(item["calories"] for item in restaurant_items)
        )
        protein_range = (
            min(item["protein"] for item in restaurant_items),
            max(item["protein"] for item in restaurant_items)
        )
        carbs_range = (
            min(item["carbohydrates"] for item in restaurant_items),
            max(item["carbohydrates"] for item in restaurant_items)
        )
        fats_range = (
            min(item["fats"] for item in restaurant_items),
            max(item["fats"] for item in restaurant_items)
        )
        
        restaurant_stats[restaurant] = {
            "total_items": len(restaurant_items),
            "categories": category_counts,
            "macro_ranges": {
                "calories": calories_range,
                "protein": protein_range,
                "carbs": carbs_range,
                "fats": fats_range
            }
        }
    
    print("=== Test Data Analysis ===")
    for restaurant, stats in restaurant_stats.items():
        print(f"\n{restaurant}:")
        print(f"  Total items: {stats['total_items']}")
        print(f"  Categories: {stats['categories']}")
        print(f"  Macro ranges:")
        print(f"    Calories: {stats['macro_ranges']['calories'][0]} - {stats['macro_ranges']['calories'][1]}")
        print(f"    Protein: {stats['macro_ranges']['protein'][0]} - {stats['macro_ranges']['protein'][1]}g")
        print(f"    Carbs: {stats['macro_ranges']['carbs'][0]} - {stats['macro_ranges']['carbs'][1]}g")
        print(f"    Fats: {stats['macro_ranges']['fats'][0]} - {stats['macro_ranges']['fats'][1]}g")
    
    # Calculate test limits that would work well
    all_calories = [item["calories"] for item in test_instance.all_items]
    all_protein = [item["protein"] for item in test_instance.all_items]
    all_carbs = [item["carbohydrates"] for item in test_instance.all_items]
    all_fats = [item["fats"] for item in test_instance.all_items]
    
    suggested_limits = {
        "calories": max(all_calories) // 2,
        "protein": max(all_protein) // 2,
        "carbs": max(all_carbs) // 2,
        "fats": max(all_fats) // 2
    }
    
    print("\nSuggested test limits to ensure items from all restaurants pass filtering:")
    print(f"  Calories: {suggested_limits['calories']}")
    print(f"  Protein: {suggested_limits['protein']}g")
    print(f"  Carbs: {suggested_limits['carbs']}g")
    print(f"  Fats: {suggested_limits['fats']}g")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--list":
            print_ranked_meal_permutations()
        elif sys.argv[1] == "--debug":
            debug_item_distribution()
    else:
        print("Running tests... (Use --list to print ranked meal permutations, --debug to analyze test data)")
        unittest.main()