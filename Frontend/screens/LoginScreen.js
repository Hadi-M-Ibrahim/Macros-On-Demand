import React from "react";
import { SafeAreaView, Text, StyleSheet, TouchableOpacity } from "react-native";
import Auth0 from "react-native-auth0";

const auth0 = new Auth0({
  domain: "dev-mywx83oyychy6a37.us.auth0.com",
  clientId: "EdjFXPdcXOOlqZeLz0V53pi6utaumwIW",
});

const LoginScreen = ({ navigation }) => {
  const onLogin = async () => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: "openid profile email",
      });
      navigation.navigate("Inputs");
    } catch (error) {
      console.log(error);
    }
  };

  const onContinueAsGuest = () => {
    navigation.navigate("Inputs");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Macros On Demand</Text>
      <TouchableOpacity onPress={onLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onContinueAsGuest} style={styles.guestButton}>
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D8F3DC",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#1B4332",
    textAlign: "center",
  },
  loginButton: {
    marginTop: 50,
    padding: 10,
    backgroundColor: "#40916C",
    borderRadius: 5,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 20,
  },
  guestButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#081C15",
    borderRadius: 5,
  },
  guestButtonText: {
    color: "#FFF",
    fontSize: 12,
  },
});

export default LoginScreen;
