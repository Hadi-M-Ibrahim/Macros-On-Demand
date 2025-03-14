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
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "@tamagui/linear-gradient";
import { YStack, Card } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Import the API service
import { Ionicons } from "@expo/vector-icons";

const InputScreen = () => {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Add validation error states
  const [caloriesError, setCaloriesError] = useState("");
  const [proteinError, setProteinError] = useState("");
  const [carbsError, setCarbsError] = useState("");
  const [fatError, setFatError] = useState("");

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

  // Validation functions for each field
  const validateCalories = (value) => {
    if (!value) {
      setCaloriesError("Calories are required");
      return false;
    }
    if (isNaN(value) || parseFloat(value) <= 0) {
      setCaloriesError("Calories must be a positive number");
      return false;
    }
    setCaloriesError("");
    return true;
  };

  const validateProtein = (value) => {
    if (!value) {
      setProteinError("Protein is required");
      return false;
    }
    if (isNaN(value) || parseFloat(value) <= 0) {
      setProteinError("Protein must be a positive number");
      return false;
    }
    setProteinError("");
    return true;
  };

  const validateCarbs = (value) => {
    if (!value) {
      setCarbsError("Carbs are required");
      return false;
    }
    if (isNaN(value) || parseFloat(value) <= 0) {
      setCarbsError("Carbs must be a positive number");
      return false;
    }
    setCarbsError("");
    return true;
  };

  const validateFat = (value) => {
    if (!value) {
      setFatError("Fat is required");
      return false;
    }
    if (isNaN(value) || parseFloat(value) <= 0) {
      setFatError("Fat must be a positive number");
      return false;
    }
    setFatError("");
    return true;
  };

  // Run validation on input change
  const handleCaloriesChange = (value) => {
    setCalories(value);
    validateCalories(value);
  };

  const handleProteinChange = (value) => {
    setProtein(value);
    validateProtein(value);
  };

  const handleCarbsChange = (value) => {
    setCarbs(value);
    validateCarbs(value);
  };

  const handleFatChange = (value) => {
    setFat(value);
    validateFat(value);
  };

  const validateInputs = () => {
    // Run all validations
    const caloriesValid = validateCalories(calories);
    const proteinValid = validateProtein(protein);
    const carbsValid = validateCarbs(carbs);
    const fatValid = validateFat(fat);

    // Return true only if all validations pass
    return caloriesValid && proteinValid && carbsValid && fatValid;
  };

  const onSubmit = async () => {
    Vibration.vibrate();

    if (!validateInputs()) {
      // Scroll to the first error if needed
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#4A2040", "#9F6BA0"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.background}
        />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>

        {/* Profile button - Added to match results screen */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("UserProfile")}
        >
          <Ionicons name="person-circle-outline" size={50} color="white" />
        </TouchableOpacity>

        <View style={isSmallScreen ? styles.cardWrapper : styles.container}>
          <Card
            elevate
            size="$4"
            bordered
            padding="$6"
            width={"80%"}
            height={isSmallScreen ? height * 0.8 : "auto"}
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

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Calories:</Text>
                <TextInput
                  style={[
                    styles.input,
                    caloriesError ? styles.inputError : null,
                  ]}
                  value={calories}
                  onChangeText={handleCaloriesChange}
                  keyboardType="numeric"
                  placeholder="Enter target calories"
                />
                {caloriesError ? (
                  <Text style={styles.errorText}>{caloriesError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Protein (g):</Text>
                <TextInput
                  style={[
                    styles.input,
                    proteinError ? styles.inputError : null,
                  ]}
                  value={protein}
                  onChangeText={handleProteinChange}
                  keyboardType="numeric"
                  placeholder="Enter target protein"
                />
                {proteinError ? (
                  <Text style={styles.errorText}>{proteinError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Carbs (g):</Text>
                <TextInput
                  style={[styles.input, carbsError ? styles.inputError : null]}
                  value={carbs}
                  onChangeText={handleCarbsChange}
                  keyboardType="numeric"
                  placeholder="Enter target carbs"
                />
                {carbsError ? (
                  <Text style={styles.errorText}>{carbsError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fat (g):</Text>
                <TextInput
                  style={[styles.input, fatError ? styles.inputError : null]}
                  value={fat}
                  onChangeText={handleFatChange}
                  keyboardType="numeric"
                  placeholder="Enter target fat"
                />
                {fatError ? (
                  <Text style={styles.errorText}>{fatError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={onSubmit}
                disabled={isLoading}
                activeOpacity={0.7}
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
      </View>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 750;

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
    width: "100%",
  },
  cardWrapper: {
    marginTop: 50,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  // Added profile icon container to match results screen
  iconContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: "bold",
    color: "#4A2040",
    marginBottom: isSmallScreen ? 0 : 20,
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#4A2040",
    fontSize: isSmallScreen ? 12 : 18,
    marginBottom: isSmallScreen ? 1 : 5,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    height: 40,
    borderColor: "#a393a3",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    color: "#4A2040",
    width: "100%",
    borderRadius: 8,
  },
  inputError: {
    borderColor: "#FF6961",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF6961",
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: "#9F6BA0",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    marginTop: isSmallScreen ? 6 : 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
    fontSize: isSmallScreen ? 12 : 16,
  },
});

export default InputScreen;
