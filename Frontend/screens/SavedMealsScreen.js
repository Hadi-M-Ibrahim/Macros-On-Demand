import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Card } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const SavedMeals = ({ navigation }) => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedMeals = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          navigation.navigate("Login", { redirect: "SavedMeals" });
          return;
        }

        const data = await api.meals.getSavedMeals();
        setMeals(data);
      } catch (error) {
        console.error("Error fetching saved meals:", error);
        setError(error.message || "Failed to load saved meals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedMeals();
  }, [navigation]);

  const deleteMeal = async (mealId) => {
    // made a new endpoint for ts
    Alert.alert(
      "Not Implemented",
      "Delete functionality will be added in a future update"
    );
  };

  const renderMealItem = ({ item }) => {
    const { meal, food_items } = item;
    return (
      <Card style={styles.mealCard}>
        <Text style={styles.restaurantName}>{meal.restaurant}</Text>

        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.calories}</Text>
            <Text style={styles.macroLabel}>Calories</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.fats}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        <Text style={styles.itemsHeader}>Food Items:</Text>
        {food_items && food_items.length > 0 ? (
          food_items.map((item, index) => (
            <Text key={index} style={styles.foodItem}>
              • {item.item_name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No items details available</Text>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMeal(meal.id)}
        >
          <Ionicons name="trash-outline" size={18} color="white" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  useFonts({ Poppins_400Regular });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.background}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.header}>Saved Meals</Text>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              fetchSavedMeals();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="bookmark-outline" size={60} color="white" />
          <Text style={styles.emptyStateText}>
            You haven't saved any meals yet
          </Text>
          <TouchableOpacity
            style={styles.findMealsButton}
            onPress={() => navigation.navigate("Inputs")}
          >
            <Text style={styles.findMealsButtonText}>Find Meals</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(item, index) => `meal-${index}`}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  header: {
    textAlign: "center",
    color: "white",
    fontFamily: "Poppins_400Regular",
    fontSize: width * 0.07,
    marginTop: 70,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  mealCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "white",
  },
  restaurantName: {
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 10,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2040",
  },
  macroLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#888",
  },
  itemsHeader: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 10,
  },
  foodItem: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#4A2040",
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "white",
    fontFamily: "Poppins_400Regular",
    marginLeft: 8,
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: "Poppins_400Regular",
    color: "#4A2040",
    fontWeight: "bold",
  },
  emptyStateText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  findMealsButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  findMealsButtonText: {
    fontFamily: "Poppins_400Regular",
    color: "#4A2040",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    color: "#888",
    fontStyle: "italic",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
});

export default SavedMeals;
