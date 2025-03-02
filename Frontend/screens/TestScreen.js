import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Animated } from "react-native";
import { GestureHandlerRootView, PanGestureHandler, State } from "react-native-gesture-handler";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";

const foodRecommendations = [
  "Recommendation 1",
  "Recommendation 2",
  "Recommendation 3",
  "Recommendation 4",
  "Recommendation 5",
];

const TestScreen = () => {
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const getNextIndex = () => (index + 1) % foodRecommendations.length;

  const handleSwipe = (event) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END) {
      if (translationX > 50 || translationX < -50) {
        Animated.timing(translateX, {
          toValue: translationX > 0 ? width : -width,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setIndex(getNextIndex());
          translateX.setValue(0); 
        });
      }
    }
  };

  useFonts({ Poppins_400Regular });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#4A2040", "#9F6BA0"]} start={[0, 0]} end={[1, 1]} style={StyleSheet.absoluteFill} />
      <GestureHandlerRootView style={styles.container}>
        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <Animated.View style={[styles.box, { transform: [{ translateX }] }]}>
            <Text style={styles.text}>{foodRecommendations[index]}</Text>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </SafeAreaView>
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
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  text: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: 20,
  },
});

export default TestScreen;
