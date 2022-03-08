import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendsScreen extends Component {
  /* This is the Friends Screen
  This class loads in the friends, friend requests and people to add
  It then returns the data into 3 different tabs that the user can
  swap between */
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      findFriendsList: [],
      friendsList: [],
      tabSelect: 'myFriends',
    };
  }

  // When the component mounts set the relevant states and then run the required functions
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
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

  // This function gets a list of users that the user can add as a friend and stores it in an array
  findFriends = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(`http://${global.ip}:3333/api/1.0.0/search`, {
      headers: {
        'X-Authorization': authValue,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw response.status;
      })
      .then((responseJson) => {
        // Setting the states to stop loading
        this.setState({
          isLoading: false,
          findFriendsList: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function gets the friends of the user and adds them to an array
  getFriends = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/friends`,
      {
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw response.status;
      })
      .then((responseJson) => {
        // Setting the states to stop loading
        this.setState({
          isLoading: false,
          friendsList: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function gets an array of all the friend requests a user has
  getFriendRequest = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(`http://${global.ip}:3333/api/1.0.0/friendrequests`, {
      headers: {
        'X-Authorization': authValue,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw response.status;
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

  // This function accepts or denys a friend request based on the variable decision
  friendDecision = async (friendId, decision) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/friendrequests/${friendId}`,
      {
        // Var decision is sent as either "POST" or "DELETE"
        method: decision,
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          this.componentDidMount();
          return response.json();
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function adds a friend using their id
  addFriend = async (friendId) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${friendId}/friends`,
      {
        method: 'post',
        headers: {
          'X-Authorization': authValue,
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          this.componentDidMount();
          return response.json();
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // If not logged in sign out the user
  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      await AsyncStorage.removeItem('@session_token');
      await AsyncStorage.removeItem('@session_id');
      this.props.navigation.navigate('Login');
    }
  };

  // Here we load in the 3 different pages which are selected depending on the state tabSelect
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      );
    } if (this.state.tabSelect === 'myFriends') {
      return (
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.selectedTab}
              onPress={() => this.setState({ tabSelect: 'myFriends' })}
            >
              <Text style={{ color: 'grey' }}>My Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: 'friendReq' })}
            >
              <Text>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: 'findFriends' })}
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
                  {item.user_givenname}
                  {' '}
                  {item.user_familyname}
                </Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.props.navigation.navigate('Profile', {
                    selectedId: item.user_id,
                  })}
                >
                  <Text>View Profile</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.user_id.toString()}
          />
        </View>
      );
    } if (this.state.tabSelect === 'friendReq') {
      return (
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: 'myFriends' })}
            >
              <Text>My Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectedTab}
              onPress={() => this.setState({ tabSelect: 'friendReq' })}
            >
              <Text style={{ color: 'grey' }}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => this.setState({ tabSelect: 'findFriends' })}
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
                  {item.first_name}
                  {' '}
                  {item.last_name}
                </Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.friendDecision(item.user_id.toString(), 'POST')}
                >
                  <Text>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => this.friendDecision(item.user_id.toString(), 'DELETE')}
                >
                  <Text>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.user_id.toString()}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.setState({ tabSelect: 'myFriends' })}
          >
            <Text>My Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.setState({ tabSelect: 'friendReq' })}
          >
            <Text>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectedTab}
            onPress={() => this.setState({ tabSelect: 'findFriends' })}
          >
            <Text style={{ color: 'grey' }}>Find Friends</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Find Friends</Text>
        <FlatList
          data={this.state.findFriendsList}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.text}>
                {item.user_givenname}
                {' '}
                {item.user_familyname}
              </Text>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={() => this.props.navigation.navigate('Profile', {
                  selectedId: item.user_id,
                })}
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
          keyExtractor={(item) => item.user_id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    width: 310,
    justifyContent: 'center',
    padding: 0,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#1269c7',
    margin: 15,
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
  tabButton: {
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: '32.9%',
  },
  selectedTab: {
    backgroundColor: '#303030',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 0,
    padding: 5,
    width: '32.9%',
  },
  text: {
    color: '#1269c7',
  },
});

export default FriendsScreen;
