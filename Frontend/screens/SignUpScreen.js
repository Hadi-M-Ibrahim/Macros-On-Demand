import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Image,
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password validation
  const [isPasswordLongEnough, setIsPasswordLongEnough] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeMatchAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  // Check password length whenever it changes
  useEffect(() => {
    const isLongEnough = password.length >= 8;
    setIsPasswordLongEnough(isLongEnough);

    // Fade in/out the message based on whether user has started typing a password
    if (password.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [password]);

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    setPasswordsMatch(
      password === confirmPassword && confirmPassword.length > 0
    );

    // Show match message only when user has started typing in confirm password field
    if (confirmPassword.length > 0) {
      Animated.timing(fadeMatchAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeMatchAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [password, confirmPassword]);

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

    // Check if email is valid
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check if password is long enough
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // check if email exists
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("Email already exists. Redirecting to login...");
        setIsLoading(false);

        // Wait briefly then redirect to login
        setTimeout(() => {
          navigation.navigate("Login", { email: email });
        }, 1500);
        return;
      }
    } catch (error) {
      console.error("Error checking email:", error);
      // Continue with registration attempt even if email check fails
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
          navigation.navigate("Login", { email: email });
        }, 1500);
      } else {
        setError(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    setError("");
    setIsGoogleLoading(true);
  
    try {
      console.log("Starting Google signup flow");
      const result = await api.auth.googleAuth();
      console.log("Google signup successful:", result);
      
      // Check if user was newly created
      if (result.user && result.user.newly_created) {
        Alert.alert("Success", "Account created successfully with Google.");
      }
      
      // Navigate to inputs screen
      navigation.navigate("Inputs");
    } catch (error) {
      console.error("Google signup error:", error);
      setError(error.message || "Google signup failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
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
              autoCapitalize="none"
              keyboardType="email-address"
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
              style={{ ...(isSmallScreen && { marginBottom: 0 }) }}
            />

            {/* Simple password length indicator that fades in with no extra spacing */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                height: 20,
                marginBottom: 0,
                position: "absolute",
                bottom: -20,
                left: 0,
              }}
            >
              <Text
                style={{
                  fontSize: isSmallScreen ? 10 : 12,
                  color: isPasswordLongEnough ? "#4CAF50" : "#FF6961",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {isPasswordLongEnough
                  ? "✓ Password length valid"
                  : "× Password must be 8+ characters"}
              </Text>
            </Animated.View>
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
              style={{ ...(isSmallScreen && { marginBottom: 0 }) }}
            />

            {/* Password matching indicator */}
            <Animated.View
              style={{
                opacity: fadeMatchAnim,
                height: 20,
                marginBottom: 0,
                position: "absolute",
                bottom: -20,
                left: 0,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: passwordsMatch ? "#4CAF50" : "#FF6961",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "× Passwords don't match"}
              </Text>
            </Animated.View>
          </Stack>

          <TouchableOpacity
            style={[
              styles.button,
              isSmallScreen && { paddingVertical: 8, paddingHorizontal: 12 },
              ((password.length > 0 && !isPasswordLongEnough) ||
                (confirmPassword.length > 0 && !passwordsMatch)) &&
                styles.disabledButton,
            ]}
            onPress={onSignUp}
            disabled={
              isLoading ||
              (password.length > 0 && !isPasswordLongEnough) ||
              (confirmPassword.length > 0 && !passwordsMatch)
            }
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          
          {/* Separator with "OR" text */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>
          
          {/* Google Sign-Up Button */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.7}
            onPress={handleGoogleSignUp}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <>
                <Text
                  style={styles.googleButtonText}
                  fontFamily="Poppins_400Regular"
                >
                  Sign up with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Button
            style={{
              backgroundColor: "transparent",
              alignSelf: "center",
              marginTop: 10, // Adjusted for better spacing with the Google button
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
  disabledButton: {
    backgroundColor: "#ccaac7", // Lighter purple for disabled state
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    paddingHorizontal: 10,
    color: '#888',
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 14,
  },
});

export default SignUpScreen;