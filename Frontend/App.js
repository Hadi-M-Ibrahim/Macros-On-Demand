import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { isFirstLaunch } from "./storageUtils";

import { TamaguiProvider, Theme } from "tamagui";
import config from "./tamagui.config";

import SignUpScreen from "./screens/SignUpScreen";
import LoginScreen from "./screens/LoginScreen";
import InputScreen from "./screens/InputScreen";
import ResultsScreen from "./screens/ResultsScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isFirstLaunch ? "SignUp" : "Login"}
          >
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Inputs"
              component={InputScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Theme>
    </TamaguiProvider>
  );
};

export default App;
