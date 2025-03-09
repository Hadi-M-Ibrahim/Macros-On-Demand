import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Vibration,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IdealMenuItem } from "../Internal";
import { LinearGradient } from "@tamagui/linear-gradient";
import { YStack, Card } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";

const InputScreen = () => {
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  const OnSubmit = () => {
    Vibration.vibrate();

    const UsersIdealItem = new IdealMenuItem(
      "IdealMenuItem",
      "User",
      calories,
      protein,
      carbs,
      fat
    );

    navigation.navigate("Results");
  };

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
          />
          <Text style={styles.label}>Protein (g):</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Carbs (g):</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Fat (g):</Text>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={OnSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
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
});

export default InputScreen;
