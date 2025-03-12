import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const UserProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndGetUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        if (!token) {
          // No token found, redirect to login
          navigation.replace("Login");
          return;
        }

        // Get user data
        const userResponse = await api.auth.getUserDetails();
        setUserData(userResponse);
      } catch (error) {
        console.error("Profile error:", error);

        // Handle token expiration or other auth errors
        if (error.message.includes("token") || error.message.includes("auth")) {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndGetUser();
  }, [navigation]);

  const logout = async () => {
    try {
      
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userData"]);
      const remaining = await AsyncStorage.getAllKeys();
      
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={["#4A2040", "#9F6BA0"]}
          start={[1, 0]}
          end={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[1, 0]}
        end={[0, 1]}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <Ionicons
          name="person-circle-outline"
          size={100}
          color="white"
          style={styles.profileIcon}
        />
        {userData && <Text style={styles.emailText}>{userData.email}</Text>}
      </View>

      <View style={styles.menuContainer}>
        {userData && userData.calories_goal && (
          <View style={styles.macrosContainer}>
            <Text style={styles.macrosTitle}>Your Macro Goals</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{userData.calories_goal}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{userData.protein_goal}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{userData.carbs_goal}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{userData.fats_goal}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Inputs")}
        >
          <Ionicons
            name="calculator-outline"
            size={24}
            color="white"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Update Macro Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("SavedMeals")}
        >
          <Ionicons
            name="bookmark-outline"
            size={24}
            color="white"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Saved Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={() => {
            logout();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6961" style={styles.menuIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 100,
    marginBottom: 40,
  },
  profileIcon: {
    marginBottom: 15,
  },
  emailText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  menuContainer: {
    paddingHorizontal: 30,
  },
  macrosContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  macrosTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  macroLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 105, 97, 0.3)",
    marginTop: 30,
  },
  logoutText: {
    color: "#FF6961",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default UserProfile;
