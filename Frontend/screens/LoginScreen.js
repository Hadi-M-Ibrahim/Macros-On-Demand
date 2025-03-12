import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Import the API service

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
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

      // TEMP: Retrieve and log the access token for debugging
      try {
        const token = await AsyncStorage.getItem("accessToken");
        console.log("Access Token:", token);
      } catch (err) {
        console.error("Error retrieving token:", err);
      }
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

  const { width, height } = Dimensions.get("window");
  const isSmallScreen = height < 750; 

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
        padding={isSmallScreen ? "$1" : "$6"}
        width={"80%"}
        height={isSmallScreen ? height * 0.8 : height * 0.85} 
        backgroundColor="white"
        borderWidth={0}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 5, height: 10 }}
        shadowOpacity={0.3}
        shadowRadius={6}
      >
        <YStack
          space={isSmallScreen ? "$1" : "$4"}
          padding={isSmallScreen ? "$2" : "$4"}
          borderRadius="$4"
          backgroundColor="$color2"
          alignItems="center"
        >
          <Text
            fontSize={isSmallScreen ? "$6" : "$8"}
            fontWeight="bold"
            color="#4A2040"
            textAlign="center"
            fontFamily="Poppins_400Regular"
            style={{ ...(isSmallScreen && { marginBottom: 50 }) }}
          >
            Macros On Demand
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Stack width="100%">
            <Text fontSize={isSmallScreen ? 12 : 14} fontFamily="Poppins_400Regular">Email</Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              padding={isSmallScreen ? "$1" : "$2"}
              style={{ ...(isSmallScreen && { marginBottom: 20 }) }}
            />
          </Stack>

          <Stack width="100%">
            <Text fontSize={isSmallScreen ? 12 : 14}  fontFamily="Poppins_400Regular">Password</Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              padding={isSmallScreen ? "$1" : "$2"}
              style={{ ...(isSmallScreen && { marginBottom: 20 }) }}
            />
          </Stack>

          <TouchableOpacity
            style={[
              styles.button,
              isSmallScreen && { paddingVertical: 8, paddingHorizontal: 12 },
              (isSmallScreen && { marginBottom: 100 }),
            ]}
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
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: isSmallScreen ? 12 : 14,
              }}
            >
              Don't have an account?
            </Text>
            <Text
              style={{
                color: "#0000FF",
                textAlign: "center",
                fontSize: isSmallScreen ? 14 : 16,
              }}
            >
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
