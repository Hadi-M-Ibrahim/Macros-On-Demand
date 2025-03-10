import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  // valid8 email using regex
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onSignUp = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // password and confirm password need to be ==
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // clear previous errors
    setError("");

    try {
      // POST request to signup endpoint.
      const response = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirm_password: confirmPassword,
        }),
      });

      // Log response status for debugging
      console.log("Response status:", response.status);

      const data = await response.json();
      // Log response data for debugging
      console.log("Response data:", data);

      if (response.ok) {
        // store tokens using AsyncStorage
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        Alert.alert("Success", "Account created successfully.");
        // navigate to InputScreen after a successful signup
        navigation.navigate("InputScreen");
      } else {
        // display any backend error
        console.error("Backend error:", data);
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
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
              autoCapitalize="none"
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

          <Stack width="100%">
            <Text fontFamily="Poppins_400Regular">Confirm Password</Text>
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              padding="$2"
            />
          </Stack>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={onSignUp}
          >
            <Text
              color="white"
              fontWeight="bold"
              fontFamily="Poppins_400Regular"
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <Button
            style={{ backgroundColor: "transparent", alignSelf: "center" }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ color: "black", textAlign: "center" }}>
              Already have an account?{" "}
              <Text style={{ color: "#0000FF", textAlign: "center" }}>
                Login
              </Text>
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
    backgroundColor: "pink",
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

export default SignUpScreen;
