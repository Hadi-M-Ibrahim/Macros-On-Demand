import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://35.185.248.192:8000/api";

// In-memory cache for API responses
const apiCache = {
  mealOptions: {},
  rankedMealOptions: {},
  savedMeals: null,
  userDetails: null,
  cacheExpiry: {},
  // Default cache expiration time (15 minutes in milliseconds)
  DEFAULT_CACHE_TIME: 15 * 60 * 1000,
};

// Helper function to create cache keys from parameters
const createCacheKey = (params) => {
  return Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
};

// Helper function to check if cache is valid
const isCacheValid = (cacheKey) => {
  if (!apiCache.cacheExpiry[cacheKey]) return false;
  return apiCache.cacheExpiry[cacheKey] > Date.now();
};

// Helper function to add item to cache with expiration
const addToCache = (cacheType, cacheKey, data, expiryTime = null) => {
  apiCache[cacheType][cacheKey] = data;
  apiCache.cacheExpiry[cacheKey] =
    Date.now() + (expiryTime || apiCache.DEFAULT_CACHE_TIME);

  // Log cache activity in development
  if (__DEV__) {
    console.log(`[API Cache] Added to ${cacheType} cache: ${cacheKey}`);
  }
};

// Helper function to clear specific cache
const clearCache = (cacheType = null) => {
  if (cacheType) {
    apiCache[cacheType] = {};
    // Only clear expiry entries for this cache type
    Object.keys(apiCache.cacheExpiry).forEach((key) => {
      if (key.startsWith(`${cacheType}:`)) {
        delete apiCache.cacheExpiry[key];
      }
    });
  } else {
    // Clear all caches
    Object.keys(apiCache).forEach((key) => {
      if (typeof apiCache[key] === "object") {
        apiCache[key] = {};
      }
    });
    apiCache.cacheExpiry = {};
  }

  if (__DEV__) {
    console.log(`[API Cache] Cleared ${cacheType || "all"} cache`);
  }
};

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
        const data = await handleResponse(response);

        // Clear caches when user registers
        clearCache();

        return data;
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
        const data = await handleResponse(response);

        // Clear caches when user logs in
        clearCache();

        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    // Get user details with caching
    getUserDetails: async () => {
      try {
        // Check cache first
        if (apiCache.userDetails && isCacheValid("userDetails")) {
          if (__DEV__) console.log("[API Cache] Using cached user details");
          return apiCache.userDetails;
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/user/`, {
          method: "GET",
          headers,
        });
        const data = await handleResponse(response);

        // Cache the user details
        apiCache.userDetails = data;
        addToCache("userDetails", "userDetails", data, 5 * 60 * 1000); // 5 minute cache

        return data;
      } catch (error) {
        console.error("Get user details error:", error);
        throw error;
      }
    },

    // Logout
    logout: async () => {
      try {
        // Clear tokens from AsyncStorage
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");

        // Clear all caches when user logs out
        clearCache();

        return { success: true };
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
  },

  // Macro preferences endpoints
  macros: {
    // Get user's macro preferences
    getPreferences: async () => {
      try {
        // Check cache first - shorter cache time for preferences
        const cacheKey = "userPreferences";
        if (apiCache.userPreferences && isCacheValid(cacheKey)) {
          if (__DEV__) console.log("[API Cache] Using cached preferences");
          return apiCache.userPreferences;
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/preferences/`, {
          method: "GET",
          headers,
        });
        const data = await handleResponse(response);

        // Cache the preferences
        addToCache("userPreferences", cacheKey, data, 5 * 60 * 1000); // 5 minute cache

        return data;
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
        const data = await handleResponse(response);

        // Update cache with new preferences
        addToCache("userPreferences", "userPreferences", data);

        // Clear meal options cache since preferences changed
        clearCache("mealOptions");
        clearCache("rankedMealOptions");

        return data;
      } catch (error) {
        console.error("Update preferences error:", error);
        throw error;
      }
    },
  },

  // meal endpoints
  meals: {
    // Get meal options based on macro goals with caching
    getMealOptions: async (macroGoals) => {
      try {
        // Create a cache key from the macro goals
        const macroParams = {
          calories: macroGoals.calories || 0,
          protein: macroGoals.protein || 0,
          carbs: macroGoals.carbs || 0,
          fats: macroGoals.fats || 0,
          protein_flexible: macroGoals.protein_flexible || false,
        };
        const cacheKey = createCacheKey(macroParams);

        // Check if we have cached results
        if (
          apiCache.mealOptions[cacheKey] &&
          isCacheValid(`mealOptions:${cacheKey}`)
        ) {
          if (__DEV__) console.log("[API Cache] Using cached meal options");
          return apiCache.mealOptions[cacheKey];
        }

        // If not in cache, make the API call
        const queryParams = new URLSearchParams({
          calories: macroGoals.calories || "",
          protein: macroGoals.protein || "",
          carbs: macroGoals.carbs || "",
          fats: macroGoals.fats || "",
          protein_flexible: macroGoals.protein_flexible || false,
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
        const data = await handleResponse(response);

        // Store in cache
        addToCache("mealOptions", cacheKey, data);

        return data;
      } catch (error) {
        console.error("Get meal options error:", error);
        throw error;
      }
    },

    // get ranked meal options with caching
    getRankedMealOptions: async (macroGoals) => {
      try {
        // Create a cache key from the macro goals
        const macroParams = {
          calories: macroGoals.calories || 0,
          protein: macroGoals.protein || 0,
          carbs: macroGoals.carbs || 0,
          fats: macroGoals.fats || 0,
          protein_bonus: macroGoals.protein_bonus !== false, // default to true
          protein_flexible: macroGoals.protein_flexible || false,
        };
        const cacheKey = createCacheKey(macroParams);

        // Check if we have cached results
        if (
          apiCache.rankedMealOptions[cacheKey] &&
          isCacheValid(`rankedMealOptions:${cacheKey}`)
        ) {
          if (__DEV__)
            console.log("[API Cache] Using cached ranked meal options");
          return apiCache.rankedMealOptions[cacheKey];
        }

        // If not in cache, make the API call
        const queryParams = new URLSearchParams({
          calories: macroGoals.calories || "",
          protein: macroGoals.protein || "",
          carbs: macroGoals.carbs || "",
          fats: macroGoals.fats || "",
          protein_bonus: macroGoals.protein_bonus !== false ? "true" : "false",
          protein_flexible: macroGoals.protein_flexible ? "true" : "false",
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
        const data = await handleResponse(response);

        // Store in cache
        addToCache("rankedMealOptions", cacheKey, data);

        return data;
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
        const data = await handleResponse(response);

        // Clear saved meals cache when adding a new meal
        clearCache("savedMeals");

        return data;
      } catch (error) {
        console.error("Save meal error:", error);
        throw error;
      }
    },

    // get saved meals with caching
    getSavedMeals: async () => {
      try {
        // Check cache first
        if (apiCache.savedMeals && isCacheValid("savedMeals")) {
          if (__DEV__) console.log("[API Cache] Using cached saved meals");
          return apiCache.savedMeals;
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/auth/saved-meals/`, {
          method: "GET",
          headers,
        });
        const data = await handleResponse(response);

        // Cache the saved meals
        addToCache("savedMeals", "savedMeals", data);

        return data;
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
        const data = await handleResponse(response);

        // Clear saved meals cache when deleting a meal
        clearCache("savedMeals");

        return data;
      } catch (error) {
        console.error("Delete meal error:", error);
        throw error;
      }
    },
  },

  // Cache control functions exposed for component use
  cache: {
    clearAll: () => clearCache(),
    clearMealOptions: () => clearCache("mealOptions"),
    clearRankedMealOptions: () => clearCache("rankedMealOptions"),
    clearSavedMeals: () => clearCache("savedMeals"),
    clearUserData: () => {
      clearCache("userDetails");
      clearCache("userPreferences");
    },
  },
};

export default api;
