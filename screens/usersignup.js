import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity} from 'react-native';

class UserSignup extends Component {

  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: '',
      firstname: '',
      lastname: ''
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

  handleNameInput = (firstname, lastname) => {
    //add validation
    this.setState({firstname: firstname});
    this.setState({lastname: lastname});
  }

  render() {
    let response = "";

    return (
    <View style={styles.container}>
        <TextInput style={styles.TextInput} placeholder="firstname" onChangeText={this.handeNameInput} value={this.state.firstname}/>
        <TextInput style={styles.TextInput} placeholder="lastname" onChangeText={this.handeNameInput} value={this.state.lastname}/>
        <TextInput style={styles.TextInput} placeholder="email" onChangeText={this.handeEmailInput} value={this.state.email}/>
        <TextInput style={styles.TextInput} placeholder="password" onChangeText={this.handePasswordInput} value={this.state.pass}/>
        <TextInput style={styles.TextInput} placeholder="confirm password" onChangeText={this.handePasswordInput} value={this.state.pass}/>
        <TouchableOpacity style={styles.buttonStyle}>
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
    paddingTop: 20,
  },
  TextInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 300,
    marginTop: 10,
    padding: 5,
  },
  buttonStyle: {
    marginTop: 30,
    backgroundColor: '#1269c7',
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default UserSignup;