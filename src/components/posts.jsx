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
  /* This is the posts component,
  this will load the posts of a users friends or just a single user

  TODO: Refractor as this class is pretty big
  */
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

  // When component mounts set the states and call the initial functions
  componentDidMount() {
    const { selectedId } = this.props;
    this.setState({
      isLoading: true,
      friendList: [],
      postList: [],
      postsExist: false,
    });
    // If selectedId is not undefined we only need to load posts of a single user
    if (selectedId !== undefined) {
      this.setState({
        selectedId,
      });
      this.getFriends(true);
    } else {
      this.getFriends(false);
    }
  }

  /* This function grabs all the friends of a user unless selectedId has a
  value (which means we only want the posts of 1 user) */
  getFriends = async (skip) => {
    const { selectedId } = this.state;
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    this.setState({ userId: id });
    // Fetch the friends of the user or skip if only loading one person
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
          // Store friends in a state to be used in getPosts function
          this.setState({
            friendList: responseJson,
          });
          this.getPosts(authValue, id);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // We get posts here for when loading the single user posts
    this.getPosts(authValue, selectedId);
    return '';
  };

  // This function gets the posts from friendsList or just selectedId
  getPosts = async (authValue, id) => {
    const { selectedId, friendList } = this.state;
    // need to add the user to friends list so they can see their own posts
    friendList.push({ user_id: id });
    // If only retrieveing one user just await the post fetch
    if (selectedId !== false) {
      await this.postFetch(selectedId, authValue, true);
    } else {
      /* If retrieveing multiple users await for all the postfetch
      promises to complete on the array mapping (arraylist map works
      like foreach here but is used as it works better with promises) */
      await Promise.all(
        friendList.map(async (friend) => {
          await this.postFetch(friend, authValue, false);
        }),
      );

      // now we call postOrder which orders the posts by date
      const { postList } = this.state;
      const fixed = await this.postOrder(postList);
      this.setState({ postList: fixed });
    }

    const { postList } = this.state;

    // if posts exist set postsExist to true
    if (postList[0] !== undefined) {
      this.setState({ postsExist: true });
    }

    // now we can show the user their posts
    this.setState({ isLoading: false });
  };

  // this function retrieves the posts of a user
  postFetch = async (friend, authValue, onePerson) => {
    let id;
    // if fetching for one person friend is the id else have to grab id from array objects
    if (onePerson) {
      id = friend;
    } else {
      id = friend.user_id.toString();
    }

    // simple fetch which returns an array of users posts
    return fetch(`http://${global.ip}:3333/api/1.0.0/user/${id}/post`, {
      headers: {
        'X-Authorization': authValue,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(`Got posts of ${id}`);
          return response.json();
        }
        throw response.status;
      })
      .then((responseJson) => {
        // add posts on to the end of existing list of posts
        const { postList } = this.state;
        this.setState({
          postList: [...postList, ...responseJson],
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /* This function orders all of the posts by date */
  postOrder = async (data) => {
    const newList = [data[0]];
    let skip = false;
    /* for each post compare the date with posts in newlist
    and then place the post in newlist in correct date order */
    data.forEach((i) => {
      // skip first post
      if (skip) {
        let place = 0;
        /* this for each compares the current post to each post
        in new list and based on the last post that it has a
        earlier date we then know what position it belongs */
        newList.forEach((j) => {
          const dateI = new Date(i.timestamp);
          const dateJ = new Date(j.timestamp);
          if (dateI < dateJ) {
            place = newList.indexOf(j) + 1;
          }
        });
        /* if its place in new list is less than the length
        of new list add it in the correct position by splicing the
        array then pushing the post and add then the rest of the array */
        if (place < newList.length) {
          const removedItems = newList.splice(place);
          newList.push(i);
          newList.push(...removedItems);
        } else {
          // if its position is greater then the length of the array push it
          newList.push(i);
        }
      }
      skip = true;
    });
    console.log('Reordered');
    return newList;
  };

  // This function simply deletes a post using the suppliedd ID
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
          // refreshes the posts
          this.componentDidMount();
        } else {
          throw response.status;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function simply likes the post with the supplied ID
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
        // refreshes the posts
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function simply unlikes the post with the supplied ID
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
        // refreshes the posts
        this.componentDidMount();
        if (response.status === 200) {
          return response;
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /* Here we render the posts once they have been loaded */
  render() {
    const {
      postList, isLoading, postsExist, userId,
    } = this.state;
    const { navigation } = this.props;

    // If it hasnt loaded yet show loading page
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
    // If no posts exist just show an error text
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
    /* Here we are displaying all the posts in a flatlist
    if the user owns the post they are showed a delete button
    and a edit button else if they dont own it they are showed
    a like and unlike button */
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
                  {' '}
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
    width: '100%',
  },
  post: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#202020',
    borderWidth: 2,
    padding: 5,
    width: '98%',
    alignSelf: 'center',
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
