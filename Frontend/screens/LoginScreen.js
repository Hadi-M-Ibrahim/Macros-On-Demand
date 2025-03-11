import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Import the API service

const LoginScreen = ({ navigation, route }) => {
  // have email with prefilled value from the route params if available
  const [email, setEmail] = useState(route?.params?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const onLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await api.auth.login({
        email: email,
        password: password,
      });

      // Store tokens
      await AsyncStorage.setItem("accessToken", data.access);
      await AsyncStorage.setItem("refreshToken", data.refresh);

      // Store user info if needed
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));

      // Navigate to the inputs screen
      navigation.navigate("Inputs");
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
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
        shadowRadius={6}
      >
        <YStack
          space="$4"
          padding="$4"
          borderRadius="$4"
          backgroundColor="$color2"
          alignItems="center"
        >
          <Text
            fontSize="$8"
            fontWeight="bold"
            color="#4A2040"
            textAlign="center"
            fontFamily="Poppins_400Regular"
          >
            Macros On Demand
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Email</Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              padding="$2"
            />
          </Stack>

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Password</Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              padding="$2"
            />
          </Stack>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={onLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                color="white"
                fontWeight="bold"
                fontFamily="Poppins_400Regular"
              >
                Login
              </Text>
            )}
          </TouchableOpacity>

          <Button
            style={{
              backgroundColor: "transparent",
              alignSelf: "center",
              marginTop: 10,
            }}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={{ color: "black", textAlign: "center" }}>
              Don't have an account?
            </Text>
            <Text style={{ color: "#0000FF", textAlign: "center" }}>
              Sign Up
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
  errorText: {
    color: "red",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default LoginScreen;
