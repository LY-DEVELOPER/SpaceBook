import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class Posts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      friendList: [],
      postList: [],
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
      friendList: [],
      postList: [],
    });
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
          return response.json();
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          friendList: responseJson,
        });
        this.getPosts(value, id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPosts = async (value, id) => {
    this.state.friendList.push({ user_id: id });

    for (const friend of this.state.friendList) {
      await this.postFetch(friend, value, id);
    }

    this.state.postList = await this.postOrder(this.state.postList);

    this.setState({ isLoading: false });
  };

  postFetch = async (friend, value, id) => {
    return fetch(
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
  };

  postOrder = async (data) => {
    console.log("Reodering");
    let newList = [data[0]];
    let skip = false;
    for (const i of data) {
      if (skip) {
        let place = 0;
        for (const j of newList) {
          const dateI = new Date(i.timestamp);
          const dateJ = new Date(j.timestamp);
          if (dateI < dateJ) {
            place = newList.indexOf(j) + 1;
          }
        }
        if (place < newList.length) {
          const removedItems = newList.splice(place);
          newList.push(i);
          newList.push(...removedItems);
        } else {
          newList.push(i);
        }
      }
      skip = true;
    }
    console.log("Reordered");
    return newList;
  };

  likePost = async (userId, postId) => {
    const value = await AsyncStorage.getItem("@session_token");
    return fetch(
      "http://192.168.0.56:3333/api/1.0.0/user/" +
        userId +
        "/post/" +
        postId +
        "/like",
      {
        method: "POST",
        headers: {
          "X-Authorization": value,
        },
      }
    )
      .then((response) => {
        console.log("Liking post " + postId);
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        } else if (response.status === 403){
          console.log("User has already liked this post");
        }else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  unLikePost = async (userId, postId) => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    return fetch(
      "http://192.168.0.56:3333/api/1.0.0/user/" +
        userId +
        "/post/" +
        postId +
        "/like",
      {
        method: "DELETE",
        headers: {
          "X-Authorization": value,
        },
      }
    )
      .then((response) => {
        console.log("UnLiking post " + postId);
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        } else if (response.status === 403){
          console.log("User has not liked this post");
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
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
          <FlatList
            data={this.state.postList}
            renderItem={({ item }) => (
              <View style={styles.post}>
                <Text style={styles.text}>
                  {item.author.first_name} {item.author.last_name} -{" "}
                  {new Date(item.timestamp).toDateString().substring(0, 10)} at{" "}
                  {new Date(item.timestamp).toTimeString().substring(0, 5)}
                </Text>
                <Text style={styles.postText}>{item.text}</Text>
                <Text style={styles.text}> Likes: {item.numLikes}</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => this.likePost(item.author.user_id, item.post_id)}
                  >
                    <Text>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => this.unLikePost(item.author.user_id, item.post_id)}
                  >
                    <Text>Un Like</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => item.post_id.toString()}
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
    alignItems: "stretch",
    justifyContent: "center",
    height: "100%",
    marginBottom: 5,
  },
  post: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#202020",
    borderWidth: 2,
    padding: 5,
    width: "98%",
    borderRadius: 7,
  },
  buttonStyle: {
    margin: 3,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: "20%",
  },
  text: {
    color: "#1269c7",
  },
  postText: {
    color: "#1269c7",
    margin: 10,
    minHeight: 60,
  },
});

export default Posts;
