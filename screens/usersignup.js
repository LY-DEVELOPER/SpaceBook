import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity} from 'react-native';

class UserSignup extends Component {

  constructor(props){
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    }
  }

  signup = () => {
    //Validation here...

    return fetch("http://192.168.0.44:3333/api/1.0.0/user", {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
    })
    .then((response) => {
        if(response.status === 201){
            return response.json()
        }else if(response.status === 400){
            throw 'Failed validation';
        }else{
            throw 'Something went wrong';
        }
    })
    .then((responseJson) => {
           console.log("User created with ID: ", responseJson);
           this.props.navigation.navigate("Login");
    })
    .catch((error) => {
        console.log(error);
    })
}

  render() {
    let response = "";

    return (
    <View style={styles.container}>
        <TextInput style={styles.TextInput} placeholder="firstname" onChangeText={(first_name) => this.setState({first_name})} value={this.state.first_name}/>
        <TextInput style={styles.TextInput} placeholder="lastname" onChangeText={(last_name) => this.setState({last_name})} value={this.state.last_name}/>
        <TextInput style={styles.TextInput} placeholder="email" onChangeText={(email) => this.setState({email})} value={this.state.email}/>
        <TextInput style={styles.TextInput} placeholder="password" onChangeText={(password) => this.setState({password})} value={this.state.pass}/>
        <TextInput style={styles.TextInput} placeholder="confirm password"/>
        <TouchableOpacity style={styles.buttonStyle} onPress={() => this.signup()}>
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