import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";


const SavedMealsScreen = ({ navigation }) => {
  

  useFonts({ Poppins_400Regular });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
        
        <Text style={styles.header}>Saved Meals</Text>
          
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
  box: {
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 10,
    width: width * 0.7,
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  header: {
    textAlign: "center",
    color: "#ddd",
    fontFamily: "Poppins_400Regular",
    fontSize: width * 0.05,
  },

  iconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default SavedMealsScreen;
