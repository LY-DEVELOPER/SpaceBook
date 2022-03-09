import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';

class UserSignup extends Component {
  /* This is the sign up screen here the user can enter details
  to sign up */
  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confPassword: '',
      error: '',
    };
  }

  // This function send the details to the server to create an account
  signup = async () => {
    let valid = true;
    let tempError = '';
    this.setState({ error: '' });
    // Password match validation
    if (this.state.password !== this.state.confPassword) {
      valid = false;
      tempError = `${tempError} Passwords do not match! \n`;
    }
    // Email validation
    if (!this.state.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)) {
      valid = false;
      tempError = `${tempError} Email is not valid! \n`;
    }
    // Password validation
    if (!this.state.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) {
      valid = false;
      tempError = `${tempError} Password must be great than 8 characters long, contain 1 capital letter and contain 1 number! \n`;
    }
    // Names validation
    if (!this.state.first_name.match(/^([\sA-z])+$/) || !this.state.last_name.match(/^([\sA-z])+$/)) {
      valid = false;
      tempError = `${tempError} First name & Lastname need to be at least 1 charcter long and only letters \n`;
    }
    this.setState({ error: tempError });
    // If everything is valid create user
    if (valid) {
      return fetch(`http://${global.ip}:3333/api/1.0.0/user`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      })
        .then((response) => {
          if (response.status === 201) {
            return response.json();
          }
          this.setState({ error: 'Error creating account' });
          throw response.status;
        })
        .then((responseJson) => {
        // If sign up is successfull go to login page
          console.log('User created with ID: ', responseJson);
          this.props.navigation.navigate('Login');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return null;
  };

  // Here we render textinputs for the users sign up details
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.TextInput}
          placeholder="firstname"
          placeholderTextColor="#115297"
          onChangeText={(first_name) => this.setState({ first_name })}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="lastname"
          placeholderTextColor="#115297"
          onChangeText={(last_name) => this.setState({ last_name })}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="email"
          placeholderTextColor="#115297"
          onChangeText={(email) => this.setState({ email })}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="password"
          placeholderTextColor="#115297"
          secureTextEntry
          onChangeText={(password) => this.setState({ password })}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.TextInput}
          secureTextEntry
          placeholder="confirm password"
          placeholderTextColor="#115297"
          onChangeText={(confPassword) => this.setState({ confPassword })}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.signup()}
        >
          <Text>Sign Up</Text>
        </TouchableOpacity>
        <Text>{ this.state.error }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    paddingTop: 20,
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
    marginTop: 30,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default UserSignup;
