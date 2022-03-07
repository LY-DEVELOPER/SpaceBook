import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UserLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  login = async () => fetch(`http://${global.ip}:3333/api/1.0.0/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(this.state),
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw response.status;
    })
    .then(async (responseJson) => {
      console.log(responseJson);
      await AsyncStorage.setItem('@session_token', responseJson.token);
      await AsyncStorage.setItem('@session_id', responseJson.id.toString());
      this.props.navigation.navigate('Home');
    })
    .catch((error) => {
      console.log(error);
    });

  render() {
    const response = '';

    return (
      <View style={styles.container}>
        <Text style={styles.title}>SpaceBook</Text>
        <Text style={styles.subtitle}>
          Social media thats out of this world!
        </Text>
        <TextInput
          style={styles.TextInput}
          placeholder="email"
          placeholderTextColor="#115297"
          onChangeText={(email) => this.setState({ email })}
          authValue={this.state.email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="password"
          placeholderTextColor="#115297"
          onChangeText={(password) => this.setState({ password })}
          secureTextEntry
          authValue={this.state.pass}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.login()}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.props.navigation.navigate('Signup')}
        >
          <Text>Sign Up</Text>
        </TouchableOpacity>
        <Text>{response}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 50,
    color: '#1269c7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#1269c7',
    marginBottom: 30,
  },
  TextInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 300,
    marginTop: 10,
    padding: 5,
    color: '#1269c7',
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default UserLogin;
