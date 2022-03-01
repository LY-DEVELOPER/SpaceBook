import React, { Component } from "react";
import { Button, LogoTitle, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserLogin from "./screens/userlogin";
import UserSignup from "./screens/usersignup";
import HomeScreen from "./screens/homescreen";
import PostScreen from "./screens/postscreen";
import FriendsScreen from "./screens/friendscreen";
import ProfileScreen from "./screens/profilescreen";
import ProfilePhoto from "./screens/profilephoto";

const Stack = createNativeStackNavigator();
global.ip = "192.168.1.206";

class App extends Component {
  refreshThis() {
    window.location.reload();
  }

  render() {
    return (
      <NavigationContainer>
        <StatusBar backgroundColor="#202020" />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Login"
            component={UserLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={UserSignup}
            options={{
              headerStyle: {
                backgroundColor: "#202020",
              },
              headerTintColor: "#1269c7",
              headerTitleStyle: {
                fontWeight: "bold",
                color: "#1269c7",
              },
            }}
          />
          <Stack.Screen
            name="Post"
            component={PostScreen}
            options={{
              headerStyle: {
                backgroundColor: "#202020",
              },
              headerTintColor: "#1269c7",
              headerTitleStyle: {
                fontWeight: "bold",
                color: "#1269c7",
              },
            }}
          />
          <Stack.Screen
            name="Friends"
            component={FriendsScreen}
            options={{
              headerStyle: {
                backgroundColor: "#202020",
              },
              headerTintColor: "#1269c7",
              headerTitleStyle: {
                fontWeight: "bold",
                color: "#1269c7",
              },
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerStyle: {
                backgroundColor: "#202020",
              },
              headerTintColor: "#1269c7",
              headerTitleStyle: {
                fontWeight: "bold",
                color: "#1269c7",
              },
            }}
          />
          <Stack.Screen
            name="ProfilePhoto"
            component={ProfilePhoto}
            options={{
              headerStyle: {
                backgroundColor: "#202020",
              },
              headerTintColor: "#1269c7",
              headerTitleStyle: {
                fontWeight: "bold",
                color: "#1269c7",
              },
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
