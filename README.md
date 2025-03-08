# Macros-On-Demand-MoD-

A React Native-based app that finds the nutritionally closest fast-food item to an ideal food item 


# Run Instructions for backend 
backend requires Python 3.12.8.

## Step 1: Clone the Repository

## Step 2: Create and Activate a Virtual Environment
Ensure you have Python 3.12.8 installed. Then create and activate a new virtual environment:

For Windows:
  python -m venv venv
  
  venv\Scripts\activate

For macOS/Linux:
  python -m venv venv
  s
  ource venv/bin/activate

## Step 3: Install Dependencies:
Install the required packages by running:

pip install -r requirements.txt

## Step 4: Apply Database Migrations:

python manage.py migrate

## Step 5: Run the Development Server:
Start the server with:
python manage.py runserver

will now be available at:
  http://127.0.0.1:8000/







  
