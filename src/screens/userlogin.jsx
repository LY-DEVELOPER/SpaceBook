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
  /* This is the login screen this is where the user logs in
  or can go to sign up */
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
    };
  }

  // Checking users details are legit
  login = async () => {
    this.setState({ error: '' });
    if (this.state.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
    && this.state.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) { // Validation using regex
      return fetch(`http://${global.ip}:3333/api/1.0.0/login`, {
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
          this.setState({ error: 'Email or password incorrect!' });
          throw response.status;
        })
        .then(async (responseJson) => {
          console.log(responseJson);
          // if user exists send them to the home page and store their id and auth in async storage
          await AsyncStorage.setItem('@session_token', responseJson.token);
          await AsyncStorage.setItem('@session_id', responseJson.id.toString());
          this.props.navigation.navigate('Home');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.setState({ error: 'Email or password incorrect!' });
    return null;
  };

  // Here we render textinputs so the user can log in
  render() {
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
          value={this.state.email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="password"
          placeholderTextColor="#115297"
          onChangeText={(password) => this.setState({ password })}
          secureTextEntry
          value={this.state.pass}
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
        <Text>{this.state.error}</Text>
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
