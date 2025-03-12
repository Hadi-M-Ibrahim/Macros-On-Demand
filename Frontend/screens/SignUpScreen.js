import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import api from "../services/api";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  // loading indicator until fonts load
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  // validate email with regex
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // check if email exists
  const checkEmailExists = async (email) => {
    try {
      const result = await api.auth.checkEmailExists(email);
      return result.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false; // Assume email doesn't exist if check fails
    }
  };

  const onSignUp = async () => {
    // Clear previous errors
    setError("");
    setIsLoading(true);

    //  check if email is valid
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // check if email exists
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("Email already exists. Redirecting to login...");
        setIsLoading(false);

        // Wait briefly then redirect to login
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
        return;
      }
    } catch (error) {
      console.error("Error checking email:", error);
      // Continue with registration attempt even if email check fails
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      //8 char is reccomended minimum as per https://pages.nist.gov/800-63-3/sp800-63b.html#sec5
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Use our API service
      const data = await api.auth.register({
        email: email,
        password: password,
        confirm_password: confirmPassword,
      });

      // Store tokens
      await AsyncStorage.setItem("accessToken", data.access);
      await AsyncStorage.setItem("refreshToken", data.refresh);

      // Store user info if needed
      await AsyncStorage.setItem("userData", JSON.stringify(data));

      Alert.alert("Success", "Account created successfully.");
      navigation.navigate("Inputs"); // Navigate to input screen after successful signup
    } catch (error) {
      // Check if error indicates email already exists
      if (error.message && error.message.includes("User already exists")) {
        setError("Email already exists. Redirecting to login...");

        // Wait briefly then redirect to login
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        setError(error.message || "Signup failed. Please try again.");
      }
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
        width={width * 0.8}
        // removed fixed height to allow card to expand with content
        backgroundColor="white"
        borderWidth={0}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 5, height: 10 }}
        shadowOpacity={0.3}
        shadowRadius={10}
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
          >
            Macros On Demand
          </Text>

          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: isSmallScreen ? 18 : 24,
              color: "#4A2040",
              marginTop: isSmallScreen ? 5 : 10,
              marginBottom: isSmallScreen ? 20 : 30,
            }}
          >
            Create Account
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Stack width="100%">
            <Text
              fontSize={isSmallScreen ? 12 : 14}
              fontFamily="Poppins_400Regular"
            >
              Email
            </Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              padding={isSmallScreen ? "$1" : "$2"}
              style={{ ...(isSmallScreen && { marginBottom: 20 }) }}
            />
          </Stack>

          <Stack width="100%">
            <Text
              fontSize={isSmallScreen ? 12 : 14}
              fontFamily="Poppins_400Regular"
            >
              Password
            </Text>
            <Input
              placeholder="Enter your password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              padding={isSmallScreen ? "$1" : "$2"}
              style={{ ...(isSmallScreen && { marginBottom: 20 }) }}
            />
          </Stack>

          <Stack width="100%">
            <Text
              fontSize={isSmallScreen ? 12 : 14}
              fontFamily="Poppins_400Regular"
            >
              Confirm Password
            </Text>
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              secureTextEntry
              onChangeText={setConfirmPassword}
              padding={isSmallScreen ? "$1" : "$2"}
              style={{ ...(isSmallScreen && { marginBottom: 20 }) }}
            />
          </Stack>

          <TouchableOpacity
            style={[
              styles.button,
              isSmallScreen && { paddingVertical: 8, paddingHorizontal: 12 },
            ]}
            onPress={onSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <Button
            style={{
              backgroundColor: "transparent",
              alignSelf: "center",
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: isSmallScreen ? 12 : 14,
              }}
            >
              Already have an account?
            </Text>
            <Text
              style={{
                color: "#0000FF",
                textAlign: "center",
                fontSize: isSmallScreen ? 14 : 16,
              }}
            >
              Log In
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
  buttonText: {
    fontFamily: "Poppins_400Regular",
    color: "white",
  },
  errorText: {
    color: "red",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 10,
    width: "100%", // ensure proper text wrapping
  },
});

export default SignUpScreen;
