import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import { MenuItems } from "../DB";
import { useRoute } from "@react-navigation/native";

const ResultsScreen = () => {
  const route = useRoute();
  const { UsersIdealItem } = route.params;

  UsersIdealItem.SetClosestItem(MenuItems);
  ClosestItem = UsersIdealItem.GetClosestItem();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What to Order</Text>
      <Text style={styles.label}>Item Name: {ClosestItem.name}</Text>
      <Text style={styles.label}>Restaurant: {ClosestItem.brand}</Text>
      <Text style={styles.label}>Calories: {ClosestItem.calories}</Text>
      <Text style={styles.label}>Protein: {ClosestItem.protein}</Text>
      <Text style={styles.label}>Carbs: {ClosestItem.carbohydrates}</Text>
      <Text style={styles.label}>Fat: {ClosestItem.fat}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8F3DC",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
  },
  label: {
    color: "#1B4332",
    fontSize: 18,
    marginBottom: 5,
  },
});

export default ResultsScreen;
