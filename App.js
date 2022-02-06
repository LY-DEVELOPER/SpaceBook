import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserLogin from './screens/userlogin';
import UserSignup from './screens/usersignup';
import HomeScreen from './screens/homescreen';

const Stack = createNativeStackNavigator();

class App extends Component{
    render(){
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Login" component={UserLogin} />
                    <Stack.Screen name="Signup" component={UserSignup} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                </Stack.Navigator>
                
            </NavigationContainer>
        );
    }
}

export default App;
