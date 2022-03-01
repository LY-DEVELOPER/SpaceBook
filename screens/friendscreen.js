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

class FriendsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      findFriendsList: [],
      friendsList: [],
      friendRequests: [],
      tabSelect: "myFriends",
    };
  }

  findFriends = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch("http://"+global.ip+":3333/api/1.0.0/search", {
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          findFriendsList: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getFriends = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch("http://"+global.ip+":3333/api/1.0.0/user/" + id + "/friends", {
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          friendsList: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getFriendRequest = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch("http://"+global.ip+":3333/api/1.0.0/friendrequests", {
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          friendsRequests: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  friendDecision = async (friendId, decision) => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch(
      "http://"+global.ip+":3333/api/1.0.0/friendrequests/" + friendId,
      {
        method: decision,
        headers: {
          "X-Authorization": value,
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addFriend = async (friendId) => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch(
      "http://"+global.ip+":3333/api/1.0.0/user/" + friendId + "/friends",
      {
        method: "post",
        headers: {
          "X-Authorization": value,
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setState({ isLoading: true });
      this.checkLoggedIn();
      this.findFriends();
      this.getFriends();
      this.getFriendRequest();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

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
          <Text style={styles.text}>Loading...</Text>
        </View>
      );
    } else if (this.state.tabSelect == "myFriends") {
      return (
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.selectedTab}
              onPress={() => this.setState({ tabSelect: "myFriends" })}
            >
              <Text>My Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "friendReq" })}
            >
              <Text>Friend Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "findFriends" })}
            >
              <Text>Find Friends</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>My Friends</Text>
          <FlatList
            data={this.state.friendsList}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.text}>
                  {item.user_givenname} {item.user_familyname}
                </Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.props.navigation.navigate("Profile", {selectedId: item.user_id})}
                >
                  <Text>View Profile</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => item.user_id.toString()}
          />
        </View>
      );
    } else if (this.state.tabSelect == "friendReq") {
      return (
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "myFriends" })}
            >
              <Text>My Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectedTab}
              onPress={() => this.setState({ tabSelect: "friendReq" })}
            >
              <Text>Friend Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "findFriends" })}
            >
              <Text>Find Friends</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Friend Requests</Text>
          <FlatList
            data={this.state.friendsRequests}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.text}>
                  {item.first_name} {item.last_name}
                </Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() =>
                    this.friendDecision(item.user_id.toString(), "POST")
                  }
                >
                  <Text>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() =>
                    this.friendDecision(item.user_id.toString(), "DELETE")
                  }
                >
                  <Text>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => item.user_id.toString()}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "myFriends" })}
            >
              <Text>My Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: "friendReq" })}
            >
              <Text>Friend Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectedTab}
              onPress={() => this.setState({ tabSelect: "findFriends" })}
            >
              <Text>Find Friends</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Find Friends</Text>
          <FlatList
            data={this.state.findFriendsList}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.text}>
                  {item.user_givenname} {item.user_familyname}
                </Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.props.navigation.navigate("Profile", {selectedId: item.user_id})}
                >
                  <Text>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.addFriend(item.user_id.toString())}
                >
                  <Text>Add</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => item.user_id.toString()}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#1269c7",
    margin: 15,
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
    margin: 1,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: "32%",
  },
  selectedTab: {
    margin: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    borderWidth: 2,
    borderBottomWidth: 0,
    padding: 5,
    width: "32%",
  },
  text: {
    color: "#1269c7",
  },
});

export default FriendsScreen;
