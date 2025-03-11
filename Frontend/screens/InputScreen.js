import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Vibration,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "@tamagui/linear-gradient";
import { YStack, Card } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Import the API service

const InputScreen = () => {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      setIsLoggedIn(!!token);

      // If logged in, try to load user's saved preferences
      if (token) {
        try {
          const preferences = await api.macros.getPreferences();
          if (preferences) {
            setCalories(
              preferences.calories_goal
                ? preferences.calories_goal.toString()
                : ""
            );
            setProtein(
              preferences.protein_goal
                ? preferences.protein_goal.toString()
                : ""
            );
            setCarbs(
              preferences.carbs_goal ? preferences.carbs_goal.toString() : ""
            );
            setFat(
              preferences.fats_goal ? preferences.fats_goal.toString() : ""
            );
          }
        } catch (error) {
          console.error("Failed to load preferences:", error);
          // Non-blocking error - just continue with empty fields
        }
      }
    };

    checkLoginStatus();
  }, []);

  const validateInputs = () => {
    // Basic validation
    if (!calories || !protein || !carbs || !fat) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return false;
    }

    // Check if values are numeric and positive
    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
      Alert.alert("Invalid Input", "All values must be numbers");
      return false;
    }

    if (
      Number(calories) <= 0 ||
      Number(protein) <= 0 ||
      Number(carbs) <= 0 ||
      Number(fat) <= 0
    ) {
      Alert.alert("Invalid Input", "All values must be positive");
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    Vibration.vibrate();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // If logged in, save preferences
      if (isLoggedIn) {
        await api.macros.updatePreferences({
          calories_goal: parseInt(calories),
          protein_goal: parseInt(protein),
          carbs_goal: parseInt(carbs),
          fats_goal: parseInt(fat),
        });
      }

      // Store macro goals for results screen
      await AsyncStorage.setItem(
        "macroGoals",
        JSON.stringify({
          calories: parseInt(calories),
          protein: parseInt(protein),
          carbs: parseInt(carbs),
          fats: parseInt(fat),
        })
      );

      // Navigate to results
      navigation.navigate("Results");
    } catch (error) {
      console.error("Failed to submit:", error);
      Alert.alert(
        "Error",
        "Failed to submit your preferences. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.background}
      />
      <Card
        elevate
        size="$4"
        bordered
        padding="$6"
        width={"80%"}
        backgroundColor="white"
        borderWidth={0}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 5, height: 10 }}
        shadowOpacity={0.3}
        shadowRadius={10}
      >
        <YStack
          space="$4"
          padding="$4"
          borderRadius="$4"
          backgroundColor="$color2"
          alignItems="center"
        >
          <Text style={styles.title}>Input Ideal Macros</Text>
          <Text style={styles.label}>Calories:</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="Enter target calories"
          />
          <Text style={styles.label}>Protein (g):</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="Enter target protein"
          />
          <Text style={styles.label}>Carbs (g):</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholder="Enter target carbs"
          />
          <Text style={styles.label}>Fat (g):</Text>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="Enter target fat"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Find Meals</Text>
            )}
          </TouchableOpacity>
        </YStack>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },
  label: {
    color: "#4A2040",
    fontSize: 18,
    marginBottom: 5,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    height: 40,
    borderColor: "#a393a3",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    color: "#4A2040",
    width: "100%",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#9F6BA0",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: 16,
  },
});

export default InputScreen;
