import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import { Button, Input, Stack, Text, YStack } from "tamagui";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    console.log("To be implemented");
  };

  const onContinueAsGuest = () => {
    navigation.navigate("Inputs");
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

        <Button
          onPress={onLogin}
          backgroundColor="#9F6BA0"
          size="$4"
          width="100%"
          borderRadius="$4"
          marginTop="$4"
        >
          Login
        </Button>

        <Button
          onPress={onContinueAsGuest}
          backgroundColor="#4A2040"
          size="$4"
          width="100%"
          borderRadius="$4"
          marginTop="$2"
        >
          Continue as Guest
        </Button>
      </YStack>
    </SafeAreaView>
  );
};

export default LoginScreen;
