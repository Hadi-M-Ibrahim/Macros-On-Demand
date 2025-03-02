import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { TamaguiProvider, Theme } from "tamagui";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import * as Font from "expo-font";

const SignUpScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#9F6BA0", "#4A2040"]}
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
        shadowRadius={6}
      >
        <YStack space="$4" alignItems="center" justifyContent="center">
          <Text
            fontSize="$8"
            fontWeight="bold"
            color="#4A2040"
            textAlign="center"
            fontFamily="Poppins_400Regular"
          >
            Macros On Demand
          </Text>

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Email</Text>
            <Input
              placeholder="Enter your email"
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Password</Text>
            <Input
              placeholder="Enter your password"
              secureTextEntry
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Confirm Password</Text>
            <Input
              placeholder="Confirm your password"
              secureTextEntry
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <TouchableOpacity style={styles.button} activeOpacity={0.7}>
            <Text
              color="white"
              fontWeight="bold"
              fontFamily="Poppins_400Regular"
            >
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button2}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Inputs")}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontFamily: "Poppins_400Regular",
              }}
            >
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Button
            style={{
              backgroundColor: "transparent",
              alignSelf: "center-end",
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontFamily: "Poppins_400Regular",
              }}
            >
              Already have an account?
            </Text>
            <Text
              style={{
                color: "#0000FF",
                textAlign: "center",
                fontFamily: "Poppins_400Regular",
              }}
            >
              Sign in
            </Text>
          </Button>
        </YStack>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#9F6BA0",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
  },
  button2: {
    backgroundColor: "#4A2040",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    marginTop: 0,
    alignItems: "center",
  },
});

export default SignUpScreen;
