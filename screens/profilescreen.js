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
      userName: "",
      userId: "",
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
    return fetch("http://"+global.ip+":3333/api/1.0.0/user/" + id, {
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
          userId: responseJson.user_id,
          userName: responseJson.first_name,
        });
        console.log("Retrieved data of user");
        console.log("Finished Loading profile Screen");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getUserProfile = async (value, id) => {
    return fetch("http://"+global.ip+":3333/api/1.0.0/user/" + id + "/photo", {
      method: "GET",
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => response.blob())
      .then((res) => {
        console.log("Type " + res.type);
        let data = URL.createObjectURL(res);
        this.setState({
          profilePic: data,
        });
        console.log(data);
        console.log("Retrieved Photo");
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
              width: 400,
              height: 400,
              borderWidth: 5,
            }}
          ></Image>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.props.navigation.navigate("ProfilePhoto")}
          >
            <Text>Take Profile Picture</Text>
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
});

export default ProfileScreen;
