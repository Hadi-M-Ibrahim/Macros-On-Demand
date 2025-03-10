import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Vibration,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IdealMenuItem } from "../Internal";
import { LinearGradient } from "@tamagui/linear-gradient";
import { YStack, Card } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const SavedMeals = () => {
  useFonts({ Poppins_400Regular });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.background}
      />

      <Text style={styles.header}>Saved Meals</Text>
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
        ></YStack>
        <Text>Item 1:</Text>
      </Card>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate("UserProfile")}
      ></TouchableOpacity>
    </View>
  );
};
const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "start",
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
    backgroundColor: "#a393a3",
    color: "#1B4332",
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

export default SavedMeals;
