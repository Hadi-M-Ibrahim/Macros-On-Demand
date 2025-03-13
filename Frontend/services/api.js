import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://35.185.248.192:8000/api";

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // If response includes error message from backend, use it
    const errorMessage = data.error || data.detail || "Something went wrong";
    throw new Error(errorMessage);
  }

  return data;
};

// Helper to refresh token when needed
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Failed to refresh token");

    // Save new access token
    await AsyncStorage.setItem("accessToken", data.access);
    return data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Clear tokens and force re-login
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    throw new Error("Session expired. Please login again.");
  }
};

// Function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// API endpoints
const api = {
  // Auth endpoints
  auth: {
    // Register a new user
    register: async (userData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },

    // check if email exists
    checkEmailExists: async (email) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-email/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        // If response is 200 email doesn't exist
        // If response is 400 email exists
        const data = await response.json();
        return {
          exists: response.status === 400,
          message: data.message,
        };
      } catch (error) {
        console.error("Email check error:", error);
        return { exists: false, message: "Error checking email" }; // Assume email dont exist if the check fails
      }
    },

    // Login user
    login: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    // Get user details
    getUserDetails: async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/user/`, {
          method: "GET",
          headers,
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Get user details error:", error);
        throw error;
      }
    },
  },

  // Macro preferences endpoints
  macros: {
    // Get user's macro preferences
    getPreferences: async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/preferences/`, {
          method: "GET",
          headers,
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Get preferences error:", error);
        throw error;
      }
    },

    // Update user's macro preferences
    updatePreferences: async (preferences) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/preferences/`, {
          method: "POST",
          headers,
          body: JSON.stringify(preferences),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Update preferences error:", error);
        throw error;
      }
    },
  },

  // meal endpoints
  meals: {
    // Get meal options based on macro goals
    getMealOptions: async (macroGoals) => {
      try {
        const queryParams = new URLSearchParams({
          calories: macroGoals.calories || "",
          protein: macroGoals.protein || "",
          carbs: macroGoals.carbs || "",
          fats: macroGoals.fats || "",
        }).toString();

        const token = await AsyncStorage.getItem("accessToken");
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" };

        const response = await fetch(
          `${API_BASE_URL}/search/meal-options/?${queryParams}`,
          {
            method: "GET",
            headers,
          }
        );
        return handleResponse(response);
      } catch (error) {
        console.error("Get meal options error:", error);
        throw error;
      }
    },

    // get ranked meal options
    getRankedMealOptions: async (macroGoals) => {
      try {
        const queryParams = new URLSearchParams({
          calories: macroGoals.calories || "",
          protein: macroGoals.protein || "",
          carbs: macroGoals.carbs || "",
          fats: macroGoals.fats || "",
        }).toString();

        const token = await AsyncStorage.getItem("accessToken");
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" };

        const response = await fetch(
          `${API_BASE_URL}/search/ranked-meals/?${queryParams}`,
          {
            method: "GET",
            headers,
          }
        );
        return handleResponse(response);
      } catch (error) {
        console.error("Get ranked meal options error:", error);
        throw error;
      }
    },

    // save meal
    saveMeal: async (mealData) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/save-meal/`, {
          method: "POST",
          headers,
          body: JSON.stringify(mealData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Save meal error:", error);
        throw error;
      }
    },

    // get saved meals
    getSavedMeals: async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/saved-meals/`, {
          method: "GET",
          headers,
        });
        return handleResponse(response);
      } catch (error) {
        console.error("Get saved meals error:", error);
        throw error;
      }
    },

    // deleting a meal
    deleteMeal: async (mealId) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_BASE_URL}/auth/delete-meal/${mealId}/`,
          {
            method: "DELETE",
            headers,
          }
        );
        return handleResponse(response);
      } catch (error) {
        console.error("Delete meal error:", error);
        throw error;
      }
    },
  },
};

export default api;
