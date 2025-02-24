import React, { useState } from "react";
import { SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Input, Stack, Text, YStack } from "tamagui";

const SignUpScreen = ({ navigation }) => {

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
        width={500}
      >
        <Text
          fontSize="$6"
          fontWeight="bold"
          color="#4A2040"
          textAlign="center"
          fontFamily="$heading"
        >
          Sign Up 
        </Text>

        <Stack width="100%">
          <Text>Email</Text>
          <Input
            placeholder="Enter your email: "
            padding="$2"
          />
        </Stack>

        <Stack width="100%">
          <Text>Password</Text>
          <Input
            placeholder="Enter your password: "
            secureTextEntry
            padding="$2"
          />
        </Stack>

        <Stack width="100%">
          <Text>Confirm Password</Text>
          <Input
            placeholder="Enter your password: "
            secureTextEntry
            padding="$2"
          />
        </Stack>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.25}
        >
          Create Account
        </TouchableOpacity>

       

      <Button style={{
        backgroundColor: "transparent",
        alignSelf: "flex-end"
      }} 
      onPress={() => navigation.navigate('Login')}
      >
        <Text style={{color: "#0000FF", textAlign: "center"}}>
        Already have an account? Sign in 
        </Text>
      </Button>

      </YStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#9F6BA0",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center"
  },
});


export default SignUpScreen;
