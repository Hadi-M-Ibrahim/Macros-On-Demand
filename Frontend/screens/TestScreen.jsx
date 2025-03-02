import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { SafeAreaFrameContext } from "react-native-safe-area-context";
import { Button, Input, Stack,  YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { TamaguiProvider, Theme} from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import * as Font from "expo-font";

const TestScreen = () => {
  const renderLeftActions = () => <View style={styles.action}><Text>Left Action</Text></View>;
  const renderRightActions = () => <View style={styles.action}><Text>Right Action</Text></View>;

  return (
<SafeAreaView style={{
        flex: 1
      
      }}>
<LinearGradient
        colors={["#4A2040", "#9F6BA0"]}
        start={[0, 0]}
        end={[1, 1]}
        // style={styles.background}
        style={StyleSheet.absoluteFill}
      />
    <GestureHandlerRootView style={styles.container}>
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => console.log(`Swiped ${direction}`)}
      >
        <View style={styles.box}>
          <Text>Swipe me</Text>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 10,
  },
  action: {
    backgroundColor: "#e6c9f5",
    justifyContent: "center",
    padding: 20,
  },
background: {
    width: "100%",
    height: "100%",
  },
});

export default TestScreen;
