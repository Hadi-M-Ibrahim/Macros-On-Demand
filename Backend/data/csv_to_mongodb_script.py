import os
import django

# Set up Django using your settings module.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "macrosondemand.settings")
django.setup()

import csv
from apps.meals.models import FoodItem

def main():
    # Path to your CSV file (adjust if needed)
    csv_path = "data/Test Data MoD - RealData MoD.csv"
    imported_count = 0

    try:
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Extract required fields and strip extra whitespace.
                item_name = row.get("item_name", "").strip()
                restaurant = row.get("restaurant", "").strip()
                food_category = row.get("food_category", "").strip()

                if not item_name:
                    print("Skipping row: missing item_name")
                    continue
                # Convert numeric fields to floats; default to 0.0 if missing.
                try:
                    calories = float(row.get("calories", 0) or 0)
                    protein = float(row.get("protein", 0) or 0)
                    carbohydrates = float(row.get("carbohydrates", 0) or 0)
                    fats = float(row.get("total_fat", 0) or 0)
                except ValueError as e:
                    print(f"Skipping row due to conversion error: {e}")
                    continue

                # Create a FoodItem instance.
                food_item = FoodItem(
                    item_name=item_name,
                    restaurant=restaurant,
                    food_category=food_category,
                    calories=calories,
                    protein=protein,
                    carbohydrates=carbohydrates,
                    fats=fats
                )
                food_item.save()
                imported_count += 1
                print(f"Imported food item #{imported_count}: {item_name}")

    except FileNotFoundError:
        print(f"CSV file not found: {csv_path}")
        return
    except Exception as e:
        print(f"An error occurred: {e}")
        return

    print(f"Successfully imported {imported_count} food items from '{csv_path}'.")

if __name__ == "__main__":
    main()





