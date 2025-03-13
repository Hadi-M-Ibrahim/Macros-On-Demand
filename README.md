# Macros-On-Demand-MoD-

A React Native-based app that finds the nutritionally closest fast-food item to an ideal food item

# Run Instructions

Backend requires Python 3.12.8.

## Step 1: Clone the Repository

git clone https://github.com/Hadi-M-Ibrahim/Macros-On-Demand.git

## Step 2: cd into the Backend Directory

Run the following command to cd into the correct directory:

cd Backend

## Step 3: Create and Activate a Virtual Environment

Ensure you have Python 3.12.8 installed. Then create and activate a new virtual environment:

For Windows:

python -m venv venv

venv\Scripts\activate

For macOS/Linux:

python -m venv venv

source venv/bin/activate

## Step 4: Install Dependencies:

Install the required packages by running:

pip install -r requirements.txt

## Step 5: Apply Database Migrations:

Run the following command:

python manage.py migrate

## Step 6: Run the Development Server:

Start the server by running the following command:
python manage.py runserver

will now be available at:
http://127.0.0.1:8000/
