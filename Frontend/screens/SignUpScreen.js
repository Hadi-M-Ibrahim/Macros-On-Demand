import React from "react";
import { SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Input, Stack, Text, YStack, Card } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";

const SignUpScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFB6C1", "#FF69B4"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.background}
      />

      <Card
        elevate
        size="$4"
        bordered
        padding="$6"
        width={500}
        backgroundColor="white"
        borderWidth={0}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 5, height: 10 }}
        shadowOpacity={0.3}
        shadowRadius={6}
      >
        <YStack space="$4" alignItems="center">
          <Text
            fontSize="$8"
            fontWeight="bold"
            color="#4A2040"
            textAlign="center"
          >
            Sign Up
          </Text>

          <Stack width="100%">
            <Text>Email</Text>
            <Input
              placeholder="Enter your email"
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <Stack width="100%">
            <Text>Password</Text>
            <Input
              placeholder="Enter your password"
              secureTextEntry
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <Stack width="100%">
            <Text>Confirm Password</Text>
            <Input
              placeholder="Confirm your password"
              secureTextEntry
              padding="$3"
              borderWidth={1}
              borderRadius={10}
            />
          </Stack>

          <TouchableOpacity style={styles.button} activeOpacity={0.7}>
            <Text color="white" fontWeight="bold">
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button2}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Inputs")}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Button
            style={{
              backgroundColor: "transparent",
              alignSelf: "flex-end",
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ color: "#0000FF", textAlign: "center" }}>
              Already have an account? Sign in
            </Text>
          </Button>
        </YStack>
      </Card>
    </SafeAreaView>
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
