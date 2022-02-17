import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  DatePickerIOS,
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

    this.setState({isLoading: false,});
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
    console.log(newList);
    for (const i of data) {
      if (skip) {
        let place = 0;
        for (const j of newList) {
          const dateI = new Date(i.timestamp);
          const dateJ = new Date(j.timestamp);
          if (dateI < dateJ) {
            place = newList.indexOf(j) + 1;
          }
          console.log(i.timestamp + " " + place);
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
    console.log(newList);
    console.log("Reordered");
    return newList;
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
                <Text>
                  {item.author.first_name} {item.author.last_name} - {(new Date(item.timestamp)).toDateString().substring(0,10)} at {(new Date(item.timestamp)).toTimeString().substring(0,5)}
                </Text>
                <Text>{item.text}</Text>
                <Text>
                  Likes: {item.numLikes}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => hey}
                  >
                    <Text>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => hey}
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
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
    height: "100%",
  },
  post: {
    marginTop: 10,
    backgroundColor: "#fffffe",
    borderWidth: 2,
    padding: 5,
    width: "98%",
  },
  buttonStyle: {
    margin: 3,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: "20%",
  },
});

export default Posts;
