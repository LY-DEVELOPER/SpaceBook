import React, { Component } from "react";
import { Button, LogoTitle } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserLogin from "./screens/userlogin";
import UserSignup from "./screens/usersignup";
import HomeScreen from "./screens/homescreen";
import PostScreen from "./screens/postscreen";
import FriendsScreen from "./screens/friendscreen";

const Stack = createNativeStackNavigator();

class App extends Component {
  refreshThis() {
    window.location.reload();
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Login" component={UserLogin} />
          <Stack.Screen name="Signup" component={UserSignup} />
          <Stack.Screen name="Post" component={PostScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
