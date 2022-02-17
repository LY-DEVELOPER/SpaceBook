import React, { Component } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class Posts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendList: [],
      postList: [],
    };
  }

  componentDidMount() {
    this.getFriends();
  }

  getFriends = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    console.log("getting friends");
    return fetch("http://192.168.0.56:3333/api/1.0.0/user/" + id + "/friends", {
      headers: {
        "X-Authorization": value,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Got Friends");
          console.log(response.json);
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          friendList: responseJson,
        });
        console.log(this.state.friendList);
        this.getPosts();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  postOrder() {}

  getPosts = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    this.state.friendList.push({ user_id: id });
    console.log(this.state.friendList);
    for (const friend of this.state.friendList) {
      fetch(
        "http://192.168.0.56:3333/api/1.0.0/user/" +
          friend.user_id.toString() +
          "/post",
        {
          headers: {
            "X-Authorization": value,
          },
        }
      )
        .then((response) => {
          console.log("Getting posts of " + friend.user_id.toString());
          if (response.status === 200) {
            return response.json();
          } else {
            throw "Something went wrong";
          }
        })
        .then((responseJson) => {
            this.setState({
              postList: [...this.state.postList, ...responseJson],
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return;
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.postList}
          renderItem={({ item }) => (
            <View style={styles.post}>
              <Text>
                {item.author.first_name} {item.author.last_name}
              </Text>
              <Text>{item.text}</Text>
              <Text>
                Time: {item.timestamp} Likes: {item.numLikes}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => item.post_id.toString()}
        />
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
  post: {
    marginTop: 10,
    backgroundColor: "#fffffe",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default Posts;
