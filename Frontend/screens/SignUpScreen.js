import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
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

  // valid8 email with regex
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onSignUp = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      //8 char is reccomended minimum as per https://pages.nist.gov/800-63-3/sp800-63b.html#sec5
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError("");
    setIsLoading(true);

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
      
      //TEMP FOR DEBUGGING
      const token = await AsyncStorage.getItem("accessToken");
      console.log("Access Token:", token);

      Alert.alert("Success", "Account created successfully.");
      navigation.navigate("Inputs"); // Navigate to input screen after successful signup
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
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
        shadowRadius={10}
      >
        <YStack
          space="$4"
          padding="$4"
          borderRadius="$4"
          backgroundColor="$color2"
          alignItems="center"
        >
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 24,
              color: "#4A2040",
            }}
          >
            Create Account
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
              secureTextEntry
              onChangeText={setPassword}
              padding="$2"
            />
          </Stack>

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Confirm Password</Text>
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              secureTextEntry
              onChangeText={setConfirmPassword}
              padding="$2"
            />
          </Stack>

          <TouchableOpacity
            style={styles.button}
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
            <Text style={{ color: "black", textAlign: "center" }}>
              Already have an account?
            </Text>
            <Text style={{ color: "#0000FF", textAlign: "center" }}>
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
  },
});

export default SignUpScreen;
