import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import json
import sys
import os

# Add the parent directory to sys.path to import our module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the function to test
from script import check_meal_options


class TestMealAlgorithm(unittest.TestCase):
    """Test cases for the meal options algorithm"""

    def setUp(self):
        """Set up test data"""
        # Sample food items from McDonald's
        self.mcdonalds_items = [
            {
                "_id": ObjectId("67cbcd5d57283efc873ae001"),
                "restaurant": "McDonald's",
                "food_category": "Burgers",
                "calories": 500,
                "protein": 25,
                "carbohydrates": 40,
                "fats": 20
            },
            {
                "_id": ObjectId("67cbcd5d57283efc873ae002"),
                "restaurant": "McDonald's",
                "food_category": "Burgers",
                "calories": 700,
                "protein": 35,
                "carbohydrates": 50,
                "fats": 30
            },
            {
                "_id": ObjectId("67cbcd5d57283efc873ae003"),
                "restaurant": "McDonald's",
                "food_category": "Fried Potatoes",
                "calories": 300,
                "protein": 5,
                "carbohydrates": 40,
                "fats": 15
            },
            {
                "_id": ObjectId("67cbcd5d57283efc873ae004"),
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
                "_id": ObjectId("67cbcd5d57283efc873ae005"),
                "restaurant": "Burger King",
                "food_category": "Burgers",
                "calories": 550,
                "protein": 30,
                "carbohydrates": 45,
                "fats": 25
            },
            {
                "_id": ObjectId("67cbcd5d57283efc873ae006"),
                "restaurant": "Burger King",
                "food_category": "Fried Potatoes",
                "calories": 320,
                "protein": 4,
                "carbohydrates": 42,
                "fats": 16
            }
        ]
        
        # Items from excluded categories
        self.excluded_items = [
            {
                "_id": ObjectId("67cbcd5d57283efc873ae007"),
                "restaurant": "McDonald's",
                "food_category": "Beverages",
                "calories": 150,
                "protein": 0,
                "carbohydrates": 38,
                "fats": 0
            },
            {
                "_id": ObjectId("67cbcd5d57283efc873ae008"),
                "restaurant": "Burger King",
                "food_category": "Toppings & Ingredients",
                "calories": 50,
                "protein": 1,
                "carbohydrates": 5,
                "fats": 3
            }
        ]
        
        # All test items
        self.all_items = self.mcdonalds_items + self.burger_king_items + self.excluded_items

    @patch('script.get_db_connection')
    def test_same_restaurant_constraint(self, mock_get_db):
        """Test that all items in a meal come from the same restaurant"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Run the function
        calorie_limit = 1000
        protein_limit = 50
        carb_limit = 100
        fat_limit = 50
        valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        # Check that we have meals
        self.assertTrue(len(valid_meals) > 0, "Should generate at least one valid meal")
        
        # Check that each meal has items from only one restaurant
        for meal in valid_meals:
            # Get the restaurant for this meal
            restaurant = meal.get("restaurant")
            
            # Function to check if an item belongs to this restaurant
            def check_item_restaurant(item_id):
                for item in self.all_items:
                    if str(item["_id"]) == item_id:
                        return item["restaurant"] == restaurant
                return False
            
            # Check each food item in the meal
            for item_id in meal["food_item_ids"]:
                self.assertTrue(check_item_restaurant(item_id), 
                               f"Item {item_id} should be from restaurant {restaurant}")
    
    @patch('script.get_db_connection')
    def test_macronutrient_limits(self, mock_get_db):
        """Test that all meals are within the specified macronutrient limits"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Set limits
        calorie_limit = 800
        protein_limit = 40
        carb_limit = 80
        fat_limit = 35
        
        # Run the function
        valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        # Check that all meals are within limits
        for meal in valid_meals:
            macros = meal["macros"]
            self.assertLessEqual(macros["calories"], calorie_limit, 
                                "Calories should be under the limit")
            self.assertLessEqual(macros["protein"], protein_limit, 
                                "Protein should be under the limit")
            self.assertLessEqual(macros["carbs"], carb_limit, 
                                "Carbs should be under the limit")
            self.assertLessEqual(macros["fats"], fat_limit, 
                                "Fats should be under the limit")
    
    @patch('script.get_db_connection')
    def test_meal_composition(self, mock_get_db):
        """Test that meals have correct number of items in each category"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Run the function
        valid_meals = check_meal_options(1000, 50, 100, 50)
        
        # Check composition of each meal
        for meal in valid_meals:
            # Check that meal has 0-2 entrees
            self.assertLessEqual(len(meal["entrees"]), 2, "Meal should have at most 2 entrees")
            
            # Check that meal has 0-2 sides
            self.assertLessEqual(len(meal["sides"]), 2, "Meal should have at most 2 sides")
            
            # Check that meal has 0-1 desserts
            self.assertLessEqual(len(meal["desserts"]), 1, "Meal should have at most 1 dessert")
            
            # Check that meal has at least one item
            total_items = len(meal["entrees"]) + len(meal["sides"]) + len(meal["desserts"])
            self.assertGreater(total_items, 0, "Meal should have at least one item")
    
    @patch('script.get_db_connection')
    def test_excluded_categories(self, mock_get_db):
        """Test that excluded categories are not included in meals"""
        # Mock the database connection
        mock_collection = MagicMock()
        mock_collection.find.return_value = self.all_items
        mock_get_db.return_value = mock_collection
        
        # Run the function
        valid_meals = check_meal_options(1000, 50, 100, 50)
        
        # Check that no meal includes items from excluded categories
        excluded_categories = ["Beverages", "Toppings & Ingredients"]
        
        for meal in valid_meals:
            # Check all items in the meal
            for item_id in meal["food_item_ids"]:
                # Find the corresponding item in our test data
                for item in self.all_items:
                    if str(item["_id"]) == item_id:
                        self.assertNotIn(item["food_category"], excluded_categories,
                                        f"Category {item['food_category']} should be excluded")


def print_meal_permutations():
    """Run the algorithm with test data and print the valid meal permutations"""
    print("\n=== VALID MEAL PERMUTATIONS ===\n")
    
    # Create test instance to access test data
    test_instance = TestMealAlgorithm()
    test_instance.setUp()
    
    # Mock the database connection
    mock_collection = MagicMock()
    mock_collection.find.return_value = test_instance.all_items
    
    # Set test limits
    calorie_limit = 1000
    protein_limit = 50
    carb_limit = 100
    fat_limit = 50
    
    print(f"Using limits: Calories={calorie_limit}, Protein={protein_limit}g, Carbs={carb_limit}g, Fats={fat_limit}g\n")
    
    # Use patch as context manager to mock the database
    with patch('script.get_db_connection', return_value=mock_collection):
        # Run the function
        valid_meals = check_meal_options(calorie_limit, protein_limit, carb_limit, fat_limit)
        
        # Print results
        if not valid_meals:
            print("No valid meal permutations found with the given constraints.")
        else:
            print(f"Found {len(valid_meals)} valid meal permutations:\n")
            
            # Group meals by restaurant for easier reading
            meals_by_restaurant = {}
            for meal in valid_meals:
                restaurant = meal.get("restaurant")
                if restaurant not in meals_by_restaurant:
                    meals_by_restaurant[restaurant] = []
                meals_by_restaurant[restaurant].append(meal)
            
            # Print meals grouped by restaurant
            for restaurant, meals in meals_by_restaurant.items():
                print(f"\n=== {restaurant} ({len(meals)} meals) ===")
                
                for i, meal in enumerate(meals, 1):
                    # Format meal details
                    entrees_str = ", ".join([item.get("category") for item in meal["entrees"]]) if meal["entrees"] else "None"
                    sides_str = ", ".join([item.get("category") for item in meal["sides"]]) if meal["sides"] else "None"
                    desserts_str = ", ".join([item.get("category") for item in meal["desserts"]]) if meal["desserts"] else "None"
                    
                    macros = meal["macros"]
                    
                    print(f"\nMeal #{i}:")
                    print(f"  Entrees: {entrees_str}")
                    print(f"  Sides: {sides_str}")
                    print(f"  Desserts: {desserts_str}")
                    print(f"  Macros: {macros['calories']} cal, {macros['protein']}g protein, "
                          f"{macros['carbs']}g carbs, {macros['fats']}g fats")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        print_meal_permutations()
    else:
        print("Running tests... (Use --list argument to print meal permutations instead)")
        unittest.main()