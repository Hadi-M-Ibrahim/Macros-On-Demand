import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Input, Stack, Text, YStack } from "tamagui";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    console.log("To be implemented");
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "pink",
      }}
    >
      <YStack
        space="$4"
        padding="$4"
        borderRadius="$4"
        backgroundColor="$color2"
        alignItems="center"
      >
        <Text
          fontSize="$6"
          fontWeight="bold"
          color="#4A2040"
          textAlign="center"
        >
          Welcome to Macros On Demand
        </Text>

        <Stack width="100%">
          <Text>Email</Text>
          <Input
            placeholder="Enter your email: "
            value={email}
            onChangeText={setEmail}
            padding="$2"
          />
        </Stack>

        <Stack width="100%">
          <Text>Password</Text>
          <Input
            placeholder="Enter your password: "
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
        >
          <Text color="white" fontWeight="bold">
            Login
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
      </YStack>
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

export default LoginScreen;
