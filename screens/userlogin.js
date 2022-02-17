import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class UserLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };
  }

  login = async () => {
    //Validation here...

    return fetch("http://192.168.0.56:3333/api/1.0.0/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.state),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 400) {
          throw "Invalid email or password";
        } else {
          throw "Something went wrong";
        }
      })
      .then(async (responseJson) => {
        console.log(responseJson);
        await AsyncStorage.setItem("@session_token", responseJson.token);
        await AsyncStorage.setItem("@session_id", responseJson.id.toString());
        this.props.navigation.navigate("Home");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    let response = "";

    return (
      <View style={styles.container}>
        <Text style={styles.title}>SpaceBook</Text>
        <Text style={styles.subtitle}>
          Social media thats out of this world!
        </Text>
        <TextInput
          style={styles.TextInput}
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="password"
          onChangeText={(password) => this.setState({ password })}
          value={this.state.pass}
        />
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.login()}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.props.navigation.navigate("Signup")}
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
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
  },
  title: {
    fontSize: 50,
    color: "#1269c7",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#1269c7",
    marginBottom: 30,
  },
  TextInput: {
    borderWidth: 1,
    borderColor: "black",
    width: 300,
    marginTop: 10,
    padding: 5,
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default UserLogin;
