import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      listData: [],
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      profilePic: null,
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setState({ isLoading: true });
      this.checkLoggedIn();
      this.getUserData();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getUserData = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    await this.getUserProfile(value, id);
    return fetch("http://" + global.ip + ":3333/api/1.0.0/user/" + id, {
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          this.logOut();
        } else {
          this.logOut();
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          first_name: responseJson.first_name,
          last_name: responseJson.last_name,
          email: responseJson.email,
        });
        console.log("Retrieved data of user");
        console.log("Finished Loading profile Screen");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getUserProfile = async (value, id) => {
    return fetch(
      "http://" + global.ip + ":3333/api/1.0.0/user/" + id + "/photo",
      {
        method: "GET",
        headers: {
          "X-Authorization": value,
        },
      }
    )
      .then((response) => response.blob())
      .then((res) => {
        let data = URL.createObjectURL(res);
        this.setState({
          profilePic: data,
        });
        console.log("Retrieved Photo");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateUser = async (password) => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    let data;
    if (!password) {
      data = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
      };
    } else {
      data = {password: this.state.password};
    }

    return fetch("http://" + global.ip + ":3333/api/1.0.0/user/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": value,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Updated user");
          this.setState({password: ""});
        } else if (response.status === 400) {
          throw "Failed validation";
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  logOut = async () => {
    await AsyncStorage.removeItem("@session_token");
    await AsyncStorage.removeItem("@session_id");
    this.props.navigation.navigate("Login");
  };

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    if (value == null) {
      this.props.navigation.navigate("Login");
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>SpaceBook</Text>
          <Text style={styles.subtitle}>
            Social media thats out of this world!
          </Text>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Image
            source={{ uri: this.state.profilePic }}
            style={{
              width: 200,
              height: 200,
              borderWidth: 5,
              borderRadius: "100%",
            }}
          ></Image>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.props.navigation.navigate("ProfilePhoto")}
          >
            <Text>Take Profile Picture</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.TextInput}
            placeholder="firstname"
            placeholderTextColor="#115297"
            onChangeText={(first_name) => this.setState({ first_name })}
            value={this.state.first_name}
          />
          <TextInput
            style={styles.TextInput}
            placeholder="lastname"
            placeholderTextColor="#115297"
            onChangeText={(last_name) => this.setState({ last_name })}
            value={this.state.last_name}
          />
          <TextInput
            style={styles.TextInput}
            placeholder="email"
            placeholderTextColor="#115297"
            onChangeText={(email) => this.setState({ email })}
            value={this.state.email}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.updateUser(false)}
          >
            <Text>Save Changes</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.TextInput}
            placeholder="password"
            placeholderTextColor="#115297"
            secureTextEntry={true}
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.updateUser(true)}
          >
            <Text>Update Password</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 50,
    color: "#1269c7",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#1269c7",
    marginBottom: 15,
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
  tabButton: {
    margin: 3,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: "23%",
  },
  TextInput: {
    borderWidth: 1,
    borderColor: "black",
    width: 300,
    marginTop: 10,
    padding: 5,
    color: "#1269c7",
  },
});

export default ProfileScreen;
