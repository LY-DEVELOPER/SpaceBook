import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity} from 'react-native';

class UserLogin extends Component {

  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: ''
    }
  }

  handleEmailInput = (email) => {
    //add validation
    this.setState({email: email});
  }

  handlePasswordInput = (pass) => {
    //add validation
    this.setState({password: password});
  }

  render() {
    let response = "";

    return (
      <View style={styles.container}>
        <Text style={styles.title}>SpaceBook</Text>
        <Text style={styles.subtitle}>Social media thats out of this world!</Text>
        <TextInput style={styles.TextInput} placeholder="email" onChnageText={this.handeEmailInput} value={this.state.email}/>
        <TextInput style={styles.TextInput} placeholder="password" onChnageText={this.handePasswordInput} value={this.state.pass}/>
        <TouchableOpacity style={styles.buttonStyle}>
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => this.props.navigation.navigate("Signup")}>
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
    backgroundColor: '#ffffff',
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
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default UserLogin;