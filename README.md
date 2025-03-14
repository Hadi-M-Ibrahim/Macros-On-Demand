# Macros-On-Demand (MoD)

A **React Native** app that finds the **nutritionally closest fast-food item** to an ideal food item.

## Run Instructions

### Backend

The backend is already deployed on a **GCP VM**, so you **don’t need to run it locally**. Just set up the frontend and enjoy! 🎉

#### Alternatively, if you prefer to run the backend locally:

**Requirements:**

- **Python 3.12.8**
- **Update `api.js` and other IP addresses to your local IP address** before running.

#### Steps to Run Locally

##### Step 1: Clone the Repository

```sh
git clone https://github.com/Hadi-M-Ibrahim/Macros-On-Demand.git
```

##### Step 2: Navigate to the Backend Directory

```sh
cd Backend
```

##### Step 3: Create and Activate a Virtual Environment

Ensure **Python 3.12.8** is installed, then set up a virtual environment:

For **Windows**:

```sh
python -m venv venv
venv\Scripts\activate
```

For **macOS/Linux**:

```sh
python -m venv venv
source venv/bin/activate
```

##### Step 4: Install Dependencies

```sh
pip install -r requirements.txt
```

##### Step 5: Apply Database Migrations

```sh
python manage.py migrate
```

##### Step 6: Start the Backend Server

```sh
python manage.py runserver
```

The server will now be running at:  
🔗 **http://127.0.0.1:8000/**

🚨 **UCLA WiFi Notice:** If the backend does not work on **UCLA WiFi**, try using a **hotspot** or another network.

---

### Frontend

##### Step 1: Install Dependencies

Ensure **Node.js** is installed. Then, navigate to the frontend directory:

```sh
cd Frontend
npm install
```

##### Step 2: Start the Frontend Server

```sh
npm start
```

Access the app at **http://localhost:8081**.

---

### Notes

- If you're running both **frontend and backend locally**, make sure the **IP addresses in `api.js` are correctly configured**.
- The **GCP VM backend** is always available, so running it locally is _optional_.
