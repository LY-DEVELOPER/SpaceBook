import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Picker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-web';

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
      query: '',
      searchIn: 'all',
      offset: 0,
    };
  }

  // When the component mounts set the relevant states and then run the required functions
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        tabSelect: 'myFriends',
      });
      this.resetPage();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // Reload the page because calling componentDidMount was not working
  resetPage = async () => {
    this.setState({
      isLoading: true,
      findFriendsList: [],
      friendsList: [],
    });
    this.checkLoggedIn();
    await this.getFriends();
    this.findFriends();
    this.getFriendRequest();
  };

  // This function gets a list of users based on a search
  findFriends = async () => {
    this.setState({
      isLoading: false,
    });
    const authValue = await AsyncStorage.getItem('@session_token');
    return fetch(`http://${global.ip}:3333/api/1.0.0/search?q=${this.state.query}&search_in=${this.state.searchIn}&limit=5&offset=${this.state.offset}`, {
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
        console.log('Searched users');
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
        // Setting the states
        this.setState({
          friendsList: responseJson,
        });
        console.log('got friends');
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
          this.resetPage();
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
        if (response.status === 201) {
          this.resetPage();
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
              <Text>Search</Text>
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
              <Text>Search</Text>
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
            <Text style={{ color: 'grey' }}>Search</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.TextInput}
          placeholder="search"
          placeholderTextColor="#115297"
          onChangeText={(query) => this.setState({ query })}
          value={this.state.query}
          autoCapitalize="none"
        />
        <Picker
          selectedValue={this.searchIn}
          style={styles.TextInput}
          onValueChange={(searchIn) => this.setState({ searchIn })}
        >
          <Picker.Item label="Search everyone" value="all" />
          <Picker.Item label="Search my friends" value="friends" />
        </Picker>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.findFriends()}
        >
          <Text>Search</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.pageButton}
            onPress={() => {
              this.setState({ offset: this.state.offset > 0 ? this.state.offset - 5 : 0 });
              this.findFriends();
            }}
          >
            <Text>Prev Page</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pageButton}
            onPress={() => {
              this.setState({
                offset: this.state.findFriendsList.length === 5
                  ? this.state.offset + 5 : this.state.offset
              });
              this.findFriends();
            }}
          >
            <Text>Next Page</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ marginTop: 10 }}
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
  TextInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 300,
    marginTop: 10,
    padding: 5,
    color: '#1269c7',
    backgroundColor: '#303030',
  },
  pageButton: {
    margin: 10,
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 140,
  },
});

export default FriendsScreen;
