import React, { Component } from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
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
    this.setState({ isLoading: true });
    this.unsubscribe();
  }

  getUserData = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
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
        console.log("Retrieved data of user")
        console.log("Finished loading home screen")
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
          <Text style={styles.title}>SpaceBook</Text>
          <Text style={styles.subtitle}>
            Social media thats out of this world!
          </Text>
          <View style={{ flexDirection: "row", width: 300, justifyContent: "center"}}>
          <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.props.navigation.navigate("Profile")}
            >
              <Text>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.props.navigation.navigate("Post")}
            >
              <Text>Post</Text>
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
          <Posts style={styles.posts} />
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
    alignSelf: "center",
    width: "100%",
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
  tabButton: {
    margin: 3,
    backgroundColor: "#1269c7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    padding: 5,
    width: "25%",
  },
});

export default HomeScreen;
