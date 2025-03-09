import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const UserProfile = () => {
  const navigation = useNavigation();

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
      <Ionicons
        name="person-circle-outline"
        size={100}
        color="white"
        style={styles.profileIcon}
      />{" "}
      {/* navigate to saved meals screen once its made*/}
      <TouchableOpacity onPress={() => alert("Navigating to Saved Meals...")}>
        <Text style={styles.menuItem}>Saved Meals</Text>
      </TouchableOpacity>
      {/* navigate to settings screen once its made*/}
      <TouchableOpacity onPress={() => alert("Navigating to Settings...")}>
        <Text style={styles.menuItem}>Settings</Text>
      </TouchableOpacity>
      {/* actaully logout the user once auth implemented*/}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={[styles.menuItem, styles.logout]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  profileIcon: {
    marginBottom: 30,
  },
  menuItem: {
    fontSize: 22,
    color: "white",
    marginVertical: 15,
    fontWeight: "600",
  },
  logout: {
    color: "#FF6961",
  },
});

export default UserProfile;
