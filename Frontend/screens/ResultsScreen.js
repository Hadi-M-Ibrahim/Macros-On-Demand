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

const foodRec = "Recommended food: ";
const restaurantStr = "Restaurant: ";
const caloriesStr = "Calories: ";
const proteinStr = "Protein: ";
const carbStr = "Carbs: ";
const fatStr = "Fat: ";

const foodRecommendations = [
  "Recommendation 1",
  "Recommendation 2",
  "Recommendation 3",
  "Recommendation 4",
  "Recommendation 5",
];

const ResultsScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const getNextIndex = () => (index + 1) % foodRecommendations.length;
  const getPrevIndex = () =>
    (index - 1 + foodRecommendations.length) % foodRecommendations.length;

  const handleSwipe = (event) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX > 50) {
        Animated.timing(translateX, {
          toValue: width,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIndex(getNextIndex());
          translateX.setValue(0);
        });
      } else if (translationX < -50) {
        Animated.timing(translateX, {
          toValue: -width,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIndex(getPrevIndex());
          translateX.setValue(0);
        });
      }
    }
  };

  useFonts({ Poppins_400Regular });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <GestureHandlerRootView style={styles.container}>
        <PanGestureHandler
          onGestureEvent={handleSwipe}
          onHandlerStateChange={handleSwipe}
        >
          <Animated.View style={[styles.box, { transform: [{ translateX }] }]}>
            {/* <Text style={styles.text}>{foodRecommendations[index]}</Text> */}
            <Text style={styles.text}>{foodRec + "\n\n" + restaurantStr + "\n\n" + caloriesStr + "\n\n" + proteinStr + "\n\n" + carbStr + "\n\n" + fatStr}</Text>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
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
  text: {
    textAlign: "start",
    fontFamily: "Poppins_400Regular",
    fontSize: 20,
  },

  iconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default ResultsScreen;
