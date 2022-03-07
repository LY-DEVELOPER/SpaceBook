import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const likeImage = require('../images/like.png');
const unLikeImage = require('../images/unlike.png');

class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      friendList: [],
      postList: null,
      postsExist: false,
      userId: '',
      selectedId: false,
    };
  }

  componentDidMount() {
    const { selectedId } = this.props;
    this.setState({
      isLoading: true,
      friendList: [],
      postList: [],
    });
    if (selectedId !== undefined) {
      this.setState({
        selectedId,
      });
      this.getFriends(true);
    } else {
      this.getFriends(false);
    }
  }

  getFriends = async (skip) => {
    const { selectedId } = this.state;
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    this.setState({ userId: id });
    console.log('getting friends');
    if (!skip) {
      return fetch(`http://${global.ip}:3333/api/1.0.0/user/${id}/friends`, {
        headers: {
          'X-Authorization': authValue,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            console.log('Got Friends');
            return response.json();
          }
          throw response.status;
        })
        .then((responseJson) => {
          this.setState({
            friendList: responseJson,
          });
          this.getPosts(authValue, id);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.getPosts(authValue, selectedId);
    return '';
  };

  getPosts = async (authValue, id) => {
    const { selectedId, friendList } = this.state;
    friendList.push({ user_id: id });
    if (selectedId !== false) {
      await this.postFetch(selectedId, authValue, true);
    } else {
      await Promise.all(
        friendList.map(async (friend) => {
          await this.postFetch(friend, authValue, false);
        }),
      );
      const { postList } = this.state;
      const fixed = await this.postOrder(postList);
      this.setState({ postList: fixed });
    }

    const { postList } = this.state;

    if (postList[0] !== undefined) {
      this.setState({ postsExist: true });
    }

    this.setState({ isLoading: false });
  };

  postFetch = async (friend, authValue, onePerson) => {
    let id;
    if (onePerson) {
      id = friend;
    } else {
      id = friend.user_id.toString();
    }
    return fetch(`http://${global.ip}:3333/api/1.0.0/user/${id}/post`, {
      headers: {
        'X-Authorization': authValue,
      },
    })
      .then((response) => {
        console.log(`Getting posts of ${id}`);
        if (response.status === 200) {
          return response.json();
        }
        throw response.status;
      })
      .then((responseJson) => {
        const { postList } = this.state;
        this.setState({
          postList: [...postList, ...responseJson],
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  postOrder = async (data) => {
    const newList = [data[0]];
    let skip = false;
    data.forEach((i) => {
      if (skip) {
        let place = 0;
        newList.forEach((j) => {
          const dateI = new Date(i.timestamp);
          const dateJ = new Date(j.timestamp);
          if (dateI < dateJ) {
            place = newList.indexOf(j) + 1;
          }
        });
        if (place < newList.length) {
          const removedItems = newList.splice(place);
          newList.push(i);
          newList.push(...removedItems);
        } else {
          newList.push(i);
        }
      }
      skip = true;
    });
    console.log('Reordered');
    return newList;
  };

  deletePost = async (postId) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/post/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('Deleted Post');
          this.componentDidMount();
        } else {
          throw response.status;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  likePost = async (userId, postId) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${userId}/post/${postId}/like`,
      {
        method: 'POST',
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        console.log(`Liking post ${postId}`);
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        }
        if (response.status === 403) {
          console.log('User has already liked this post');
        } else {
          throw response.status;
        }
        return '';
      })
      .catch((error) => {
        console.log(error);
      });
  };

  unLikePost = async (userId, postId) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${userId}/post/${postId}/like`,
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        console.log(`UnLiking post ${postId}`);
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        }
        if (response.status === 403) {
          console.log('User has not liked this post');
        } else {
          throw response.status;
        }
        return '';
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const {
      postList, isLoading, postsExist, userId,
    } = this.state;
    const { navigation } = this.props;
    if (isLoading) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>Loading...</Text>
        </View>
      );
    }
    if (!postsExist) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>No posts to load</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={postList}
          renderItem={({ item }) => (
            <View style={styles.post}>
              <Text style={styles.text}>
                {item.author.first_name}
                {' '}
                {item.author.last_name}
                {' '}
                -
                {' '}
                {new Date(item.timestamp).toDateString().substring(0, 10)}
                {' '}
                at
                {' '}
                {new Date(item.timestamp).toTimeString().substring(0, 5)}
              </Text>
              <Text style={styles.postText}>{item.text}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.text}>
                  {' '}
                  Likes:
                  {item.numLikes}
                </Text>
                {userId === item.author.user_id.toString() ? (
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => navigation.navigate('Post', {
                      postId: item.post_id,
                    })}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.likeStyle}
                    onPress={() => this.likePost(item.author.user_id, item.post_id)}
                  >
                    <Image
                      source={likeImage}
                      style={{ width: 20, height: 28 }}
                    />
                  </TouchableOpacity>
                )}
                {userId === item.author.user_id.toString() ? (
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => this.deletePost(item.post_id)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.likeStyle}
                    onPress={() => this.unLikePost(item.author.user_id, item.post_id)}
                  >
                    <Image
                      source={unLikeImage}
                      style={{ width: 20, height: 28 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          keyExtractor={(item) => item.post_id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: '100%',
    marginBottom: 5,
    width: 300,
  },
  post: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#202020',
    borderWidth: 2,
    padding: 5,
    width: '98%',
    borderRadius: 7,
  },
  buttonStyle: {
    margin: 3,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: '20%',
  },
  likeStyle: {
    margin: 3,
    padding: 5,
    alignItems: 'center',
  },
  text: {
    color: '#1269c7',
  },
  postText: {
    color: '#1269c7',
    margin: 10,
    minHeight: 60,
  },
});

export default Posts;
