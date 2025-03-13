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
  ScrollView,
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

const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 750;

const ResultsScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mealOptions, setMealOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSecondLoadingMessage, setShowSecondLoadingMessage] =
    useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const ViewType = isSmallScreen ? ScrollView : View;


  // Show secondary loading message after 5 seconds
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSecondLoadingMessage(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Check if user is logged in and load meal options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        setIsLoggedIn(!!token);

        const macroGoalsString = await AsyncStorage.getItem("macroGoals");
        if (!macroGoalsString) {
          throw new Error("No macro goals found. Please set your goals first.");
        }
        const macroGoals = JSON.parse(macroGoalsString);

        // use the API service instead of direct fetch
        const response = await api.meals.getRankedMealOptions(macroGoals);

        // Handle both possible response formats
        let validMeals = [];
        if (response.valid_meals) {
          // original format
          validMeals = response.valid_meals;
        } else if (response.ranked_meals) {
          // Ranked meals format
          validMeals = response.ranked_meals.map((item) => item.meal);
        } else if (response.count && Array.isArray(response.ranked_meals)) {
          // Another possible format for ranked meals
          validMeals = response.ranked_meals.map((item) => item.meal);
        } else {
          throw new Error("Unexpected response format from the server");
        }

        if (!validMeals || validMeals.length === 0) {
          setError(
            "No meal options found with your criteria. Try adjusting your macro goals."
          );
          setIsLoading(false);
          return;
        }

        // Transform the meals to ensure they have the expected structure
        const processedMeals = validMeals.map((meal) => {
          return {
            meal: {
              id: meal.id || Math.random().toString(),
              restaurant: meal.restaurant || "Unknown Restaurant",
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fats: meal.fats || 0,
              food_item_ids: meal.food_item_ids || [],
              item_names: meal.item_names || [],
            },
          };
        });

        setMealOptions(processedMeals);
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

  const swipeRightAction = () => {
    Animated.timing(translateX, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      await saveMeal();
      setIndex(getNextIndex());
      translateX.setValue(0);
    });
  };

  // Swipe action for swiping left: simply skip to the next meal
  const swipeLeftAction = () => {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIndex(getNextIndex());
      translateX.setValue(0);
    });
  };

  const handleSwipe = (event) => {
    if (mealOptions.length === 0) return;
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX > 50) {
        swipeRightAction();
      } else if (translationX < -50) {
        swipeLeftAction();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    } else if (state === State.ACTIVE) {
      translateX.setValue(translationX);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        swipeRightAction();
      } else if (e.key === "ArrowLeft") {
        swipeLeftAction();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [mealOptions, index, isLoggedIn]);

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

      // Make sure all required properties exist
      const mealToSave = {
        restaurant: currentMeal.restaurant || "Unknown Restaurant",
        calories: currentMeal.calories || 0,
        protein: currentMeal.protein || 0,
        carbs: currentMeal.carbs || 0,
        fats: currentMeal.fats || 0,
        food_item_ids: currentMeal.food_item_ids || [],
      };

      const response = await api.meals.saveMeal(mealToSave);

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
          <Text style={styles.loadingSubText}>
            We're analyzing thousands of combinations to find your perfect meal.
            This may take a moment.
          </Text>
          {showSecondLoadingMessage && (
            <Text style={styles.loadingSubText}>
              Nearly there! Just making sure your meal will be perfect!
            </Text>
          )}
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
      <View style={styles.mealContentContainer}>

        <ViewType style={styles.mealDetailsContainer} contentContainerStyle={styles.mealDetailsContent}>
        {/* <ScrollView style={styles.mealDetailsContainer} contentContainerStyle={styles.mealDetailsContent}> */}
          <Text style={styles.restaurantName}>
            {currentMeal.restaurant || "Unknown Restaurant"}
          </Text>
          <View style={styles.macroContainer}>
            <Text style={styles.macroLabel}>Calories:</Text>
            <Text style={styles.macroValue}>{currentMeal.calories || 0}</Text>
          </View>
          <View style={styles.macroContainer}>
            <Text style={styles.macroLabel}>Protein:</Text>
            <Text style={styles.macroValue}>{currentMeal.protein || 0}g</Text>
          </View>
          <View style={styles.macroContainer}>
            <Text style={styles.macroLabel}>Carbs:</Text>
            <Text style={styles.macroValue}>{currentMeal.carbs || 0}g</Text>
          </View>
          <View style={styles.macroContainer}>
            <Text style={styles.macroLabel}>Fat:</Text>
            <Text style={styles.macroValue}>{currentMeal.fats || 0}g</Text>
          </View>

          <View style={styles.foodItemsContainer}>
            <Text style={styles.foodItemsHeader}>Items in this meal:</Text>
            {currentMeal.item_names && currentMeal.item_names.length > 0 ? (
              // If we have item names available, use them
              currentMeal.item_names.map((name, i) => (
                <Text key={i} style={styles.foodItemText}>
                  • {name}
                </Text>
              ))
            ) : currentMeal.food_item_ids &&
              currentMeal.food_item_ids.length > 0 ? (
              // Otherwise fall back to item IDs
              currentMeal.food_item_ids.map((id, i) => (
                <Text key={i} style={styles.foodItemText}>
                  • Item {i + 1}
                </Text>
              ))
            ) : (
              <Text style={styles.foodItemText}>
                • No items information available
              </Text>
            )}
          </View>
        </ViewType>

        {/* Nav Help Container is now positioned at the bottom of the card */}
        <View style={styles.navHelpContainer}>
          <Text style={styles.swipeText}>
            Swipe to see more options ({index + 1}/{mealOptions.length})
          </Text>
          <Text style={styles.keyboardHelpText}>
            Tip: Use ← to skip, → to save
          </Text>
        </View>
      </View>
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

      <Text style={styles.appTitle}>Macros On Demand</Text>
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

      {/* Swipe action icons */}
      <View style={styles.swipeIconContainer}>
        <TouchableOpacity onPress={swipeLeftAction} style={styles.iconButton}>
          <Ionicons name="close-circle-outline" size={50} color="white" />
          <Text style={styles.iconButtonLabel}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={swipeRightAction} style={styles.iconButton}>
          <Ionicons name="checkmark-circle-outline" size={50} color="white" />
          <Text style={styles.iconButtonLabel}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate("UserProfile")}
      >
        <Ionicons name="person-circle-outline" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: isSmallScreen ? 20 : 50,
    alignItems: "center",
    overflow: "hidden",
  },
  appTitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: isSmallScreen ? 27 : 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: isSmallScreen ? 80 : 45,
  },
  headerTitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginTop: isSmallScreen ? 7 : 2,
    marginBottom: isSmallScreen ? 2 : 15,
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: width * 0.65,
    height: height * 0.58,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  // Container for all meal content with flex layout
  mealContentContainer: {
    flex: 1,
    justifyContent: "space-between", // This pushes the nav help to the bottom
  },
  // Container for scrollable meal details
  mealDetailsContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 20,
    fontSize: 18,
    color: "#4A2040",
    textAlign: "center",
  },
  loadingSubText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 12,
    fontSize: 14,
    color: "#4A2040",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 15,
    textAlign: "center",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 6,
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
    marginTop: 15,
    marginBottom: 15,
  },
  foodItemsHeader: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 8,
  },
  foodItemText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#4A2040",
    marginBottom: 4,
  },
  // Nav help container is now positioned at the bottom of the card
  navHelpContainer: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: "auto", // This pushes it to the bottom
  },
  swipeText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 14,
    color: "#888",
  },
  keyboardHelpText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    marginTop: 4,
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
  swipeIconContainer: {
    position: isSmallScreen ? undefined : "absolute",
    bottom: isSmallScreen ? undefined : 30,
    left: isSmallScreen ? undefined : 0,
    right: isSmallScreen ? undefined : 0,
    flexDirection: "row",
    justifyContent: isSmallScreen ? "center" : "space-around",

    alignItems: isSmallScreen ? "center" : undefined,
    marginBottom: isSmallScreen ? 2 : undefined,  
  },
  iconButton: {
    padding: 10,
    alignItems: "center",
  },
  iconButtonLabel: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ResultsScreen;
