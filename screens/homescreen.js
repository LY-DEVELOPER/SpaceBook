import React, { Component } from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Posts from "../components/posts";

class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      listData: [],
      userName: "",
      userId: "",
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
    return fetch("http://192.168.0.56:3333/api/1.0.0/user/" + id, {
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
        console.log(responseJson);
        this.setState({
          isLoading: false,
          userId: responseJson.user_id,
          userName: responseJson.first_name,
        });
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
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Loading...</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>SpaceBook</Text>
          <Text style={styles.subtitle}>
            Social media thats out of this world!
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.props.navigation.navigate("Post")}
            >
              <Text>Create Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.props.navigation.navigate("Friends")}
            >
              <Text>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.logOut()}
            >
              <Text>Log Out</Text>
            </TouchableOpacity>
          </View>
          <Posts />
        </View>
      );
    }
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
    width: "30%",
  },
});

export default HomeScreen;
