import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const ResultsScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mealOptions, setMealOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const { width, height } = Dimensions.get("window");

  // Check if user is logged in and load meal options
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check login status
        const token = await AsyncStorage.getItem("accessToken");
        setIsLoggedIn(!!token);

        // Get macro goals
        const macroGoalsString = await AsyncStorage.getItem("macroGoals");
        if (!macroGoalsString) {
          throw new Error("No macro goals found. Please set your goals first.");
        }

        const macroGoals = JSON.parse(macroGoalsString);


        // Add search endpoint to the backend URLs
        const response = await fetch(
          `http://34.82.71.163:8000/api/search/meal-options/?calories=${macroGoals.calories}&protein=${macroGoals.protein}&carbs=${macroGoals.carbs}&fats=${macroGoals.fats}`,
          {
            method: "GET",
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch meal options");
        }

        if (!data.valid_meals || data.valid_meals.length === 0) {
          setError(
            "No meal options found with your criteria. Try adjusting your macro goals."
          );
          setIsLoading(false);
          return;
        }

        setMealOptions(data.valid_meals);
      } catch (error) {
        console.error("Error fetching meal options:", error);
        setError(error.message || "Failed to load meal recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNextIndex = () => (index + 1) % (mealOptions.length || 1);
  const getPrevIndex = () =>
    (index - 1 + (mealOptions.length || 1)) % (mealOptions.length || 1);

  const handleSwipe = (event) => {
    if (mealOptions.length === 0) return;

    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX > 50) {
        // Swiped right
        Animated.timing(translateX, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIndex(getPrevIndex());
          translateX.setValue(0);
        });
      } else if (translationX < -50) {
        // Swiped left
        Animated.timing(translateX, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIndex(getNextIndex());
          translateX.setValue(0);
        });
      } else {
        // Return to center if swipe wasn't far enough
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    } else if (state === State.ACTIVE) {
      // Update position while dragging
      translateX.setValue(translationX);
    }
  };

  const saveMeal = async () => {
    if (!isLoggedIn) {
      Alert.alert("Login Required", "Please login to save meals", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (mealOptions.length === 0) return;

    try {
      const currentMeal = mealOptions[index].meal;

      const response = await api.meals.saveMeal({
        restaurant: currentMeal.restaurant,
        calories: currentMeal.calories,
        protein: currentMeal.protein,
        carbs: currentMeal.carbs,
        fats: currentMeal.fats,
        food_item_ids: currentMeal.food_item_ids,
      });

      Alert.alert("Success", "Meal saved successfully!");
    } catch (error) {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to save meal. Please try again.");
    }
  };

  const [fontsLoaded] = useFonts({ Poppins_400Regular });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="white" />;
  }

  const renderMealInfo = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A2040" />
          <Text style={styles.loadingText}>Finding meal options...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={50} color="#4A2040" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate("Inputs")}
          >
            <Text style={styles.retryButtonText}>Adjust Macros</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mealOptions.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No meal options found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate("Inputs")}
          >
            <Text style={styles.retryButtonText}>Adjust Macros</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentMeal = mealOptions[index].meal;

    return (
      <>
        <Text style={styles.restaurantName}>{currentMeal.restaurant}</Text>
        <View style={styles.macroContainer}>
          <Text style={styles.macroLabel}>Calories:</Text>
          <Text style={styles.macroValue}>{currentMeal.calories}</Text>
        </View>
        <View style={styles.macroContainer}>
          <Text style={styles.macroLabel}>Protein:</Text>
          <Text style={styles.macroValue}>{currentMeal.protein}g</Text>
        </View>
        <View style={styles.macroContainer}>
          <Text style={styles.macroLabel}>Carbs:</Text>
          <Text style={styles.macroValue}>{currentMeal.carbs}g</Text>
        </View>
        <View style={styles.macroContainer}>
          <Text style={styles.macroLabel}>Fat:</Text>
          <Text style={styles.macroValue}>{currentMeal.fats}g</Text>
        </View>

        <View style={styles.foodItemsContainer}>
          <Text style={styles.foodItemsHeader}>Items in this meal:</Text>
          {/* We'd ideally fetch food item details here, but for now we'll just show IDs */}
          {currentMeal.food_item_ids.map((id, i) => (
            <Text key={i} style={styles.foodItemText}>
              • Item {i + 1}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
          <Ionicons name="bookmark-outline" size={24} color="white" />
          <Text style={styles.saveButtonText}>Save Meal</Text>
        </TouchableOpacity>

        <Text style={styles.swipeText}>
          Swipe to see more options ({index + 1}/{mealOptions.length})
        </Text>
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Meal Recommendations</Text>

      <GestureHandlerRootView style={styles.container}>
        <PanGestureHandler
          onGestureEvent={handleSwipe}
          onHandlerStateChange={handleSwipe}
          enabled={!isLoading && !error && mealOptions.length > 0}
        >
          <Animated.View style={[styles.box, { transform: [{ translateX }] }]}>
            {renderMealInfo()}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate("UserProfile")}
      >
        <Ionicons name="person-circle-outline" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerTitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginTop: 60,
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: width * 0.85,
    height: height * 0.65,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 20,
    fontSize: 16,
    color: "#4A2040",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    marginVertical: 20,
    fontSize: 16,
    color: "#4A2040",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#9F6BA0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 16,
  },
  restaurantName: {
    fontFamily: "Poppins_400Regular",
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 20,
    textAlign: "center",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  macroLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#4A2040",
  },
  macroValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#4A2040",
    fontWeight: "bold",
  },
  foodItemsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  foodItemsHeader: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 10,
  },
  foodItemText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#4A2040",
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: "#9F6BA0",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  saveButtonText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  swipeText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  iconContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 10,
  },
});

export default ResultsScreen;
