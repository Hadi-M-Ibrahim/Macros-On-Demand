import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import json
import sys
import os
import math

# Add the parent directory to sys.path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the functions to test
from script import check_meal_options
from rank_meals import calculate_rmse, rank_meal_options, get_top_ranked_meals

class TestMealRankings(unittest.TestCase):
    """Test cases for the meal ranking algorithm"""

    def setUp(self):
        """Set up test data"""
        # Sample food items from McDonald's
        self.mcdonalds_items = [
            {
                "id": ObjectId("67cbcd5d57283efc873ae001"),
                "item_name": "Big Mac",
                "restaurant": "McDonald's",
                "food_category": "Burgers",
                "calories": 500,
                "protein": 25,
                "carbohydrates": 40,
                "fats": 20
            },
            {
                "id": ObjectId("67cbcd5d57283efc873ae002"),
                "item_name": "Quarter Pounder",
                "restaurant": "McDonald's",
                "food_category": "Burgers",
                "calories": 700,
                "protein": 35,
                "carbohydrates": 50,
                "fats": 30
            },
            {
                "id": ObjectId("67cbcd5d57283efc873ae003"),
                "item_name": "Medium Fries",
                "restaurant": "McDonald's",
                "food_category": "Fried Potatoes",
                "calories": 300,
                "protein": 5,
                "carbohydrates": 40,
                "fats": 15
            },
            {
                "id": ObjectId("67cbcd5d57283efc873ae004"),
                "item_name": "McFlurry",
                "restaurant": "McDonald's",
                "food_category": "Desserts",
                "calories": 200,
                "protein": 3,
                "carbohydrates": 30,
                "fats": 10
            }
        ]
        
        # Sample food items from Burger King
        self.burger_king_items = [
            {
                "id": ObjectId("67cbcd5d57283efc873ae005"),
                "item_name": "Whopper",
                "restaurant": "Burger King",
                "food_category": "Burgers",
                "calories": 550,
                "protein": 30,
                "carbohydrates": 45,
                "fats": 25
            },
            {
                "id": ObjectId("67cbcd5d57283efc873ae006"),
                "item_name": "Medium Fries",
                "restaurant": "Burger King",
                "food_category": "Fried Potatoes",
                "calories": 320,
                "protein": 4,
                "carbohydrates": 42,
                "fats": 16
            }
        ]
        
        # All test items (excluding items from excluded categories)
        self.all_items = self.mcdonalds_items + self.burger_king_items

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
        
        # Set limits
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
    calorie_limit = 800
    protein_limit = 40
    carb_limit = 80
    fat_limit = 35
    
    print(f"Target: Calories={calorie_limit}, Protein={protein_limit}g, Carbs={carb_limit}g, Fats={fat_limit}g\n")
    
    # Use patch as context manager to mock the database
    with patch('script.get_db_connection', return_value=mock_collection):
        # Get ranked meals
        ranked_meals = rank_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        print(ranked_meals[0])

        # Print results
        if not ranked_meals:
            print("No valid meal permutations found with the given constraints.")
        else:
            print(f"Found {len(ranked_meals)} valid meal permutations, ranked by RMSE:\n")
            
            # Group meals by restaurant for easier reading
            meals_by_restaurant = {}
            for meal in ranked_meals:
                restaurant = meal["meal"]["restaurant"]
                if restaurant not in meals_by_restaurant:
                    meals_by_restaurant[restaurant] = []
                meals_by_restaurant[restaurant].append(meal)
            
            # Print ranked meals by restaurant
            for restaurant, meals in meals_by_restaurant.items():
                print(f"\n=== {restaurant} ({len(meals)} meals) ===")
                
                for meal in meals:
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

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        print_ranked_meal_permutations()
    else:
        print("Running tests... (Use --list argument to print ranked meal permutations)")
        unittest.main()