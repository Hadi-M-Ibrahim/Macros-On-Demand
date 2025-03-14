import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Animated,
  Text as RNText,
} from "react-native";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useFonts, Poppins_400Regular } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Import the API service

const LoginScreen = ({ navigation, route }) => {
  // get email parameter if it exists
  const { email: emailParam } = route.params || {};

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailToast, setShowEmailToast] = useState(false);

  // animation references
  const emailInputAnimationValue = useRef(new Animated.Value(0)).current;
  const bounceAnimationValue = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // calc animation values
  const borderColor = emailInputAnimationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#a393a3", "#9F6BA0", "#a393a3"],
  });

  const backgroundColor = emailInputAnimationValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: ["#f5f5f5", "#f8e5ff", "#f8e5ff", "#f5f5f5"],
  });

  const bounceScale = bounceAnimationValue.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [1, 1.03, 1, 1.02, 1],
  });

  // Update email state if the parameter changes (e.g., when navigating from sign-up)
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setShowEmailToast(true);

      // Start animations when email param exists
      startAnimations();
    }
  }, [emailParam]);

  const startAnimations = () => {
    // Pulsing border and background animation
    Animated.loop(
      Animated.timing(emailInputAnimationValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
      { iterations: 3 }
    ).start(() => {
      // Reset to normal appearance after animation
      emailInputAnimationValue.setValue(0);
    });

    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnimationValue, {
        toValue: 2,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimationValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Toast notification animation
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEmailToast(false);
    });
  };

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

      {/* Toast notification */}
      {showEmailToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <RNText style={styles.toastText}>
            Your email was carried over from sign-up
          </RNText>
        </Animated.View>
      )}

      <Card
        elevate
        size="$4"
        bordered
        padding={isSmallScreen ? "$1" : "$6"}
        width={"80%"}
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

          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: isSmallScreen ? 18 : 24,
              color: "#4A2040",
              marginTop: isSmallScreen ? 5 : 10,
              marginBottom: isSmallScreen ? 20 : 30,
            }}
          >
            Log In
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Stack width="100%">
            <Text
              fontSize={isSmallScreen ? 12 : 14}
              fontFamily="Poppins_400Regular"
            >
              Email
            </Text>
            <Animated.View
              style={{
                transform: [{ scale: bounceScale }],
                borderRadius: 8,
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                marginBottom: 5,
              }}
            >
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                padding={isSmallScreen ? "$1" : "$2"}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
              />
            </Animated.View>
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
                fontFamily: "Poppins_400Regular",
              }}
            >
              Don't have an account?
            </Text>
            <Text
              style={{
                color: "#0000FF",
                textAlign: "center",
                fontSize: isSmallScreen ? 12 : 14,
                fontFamily: "Poppins_400Regular",
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
  toast: {
    position: "absolute",
    top: 70,
    backgroundColor: "rgba(74, 32, 64, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    zIndex: 10,
  },
  toastText: {
    color: "white",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
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
    // add max width to ensure error message wraps properly
    width: "100%",
  },
});

export default LoginScreen;
