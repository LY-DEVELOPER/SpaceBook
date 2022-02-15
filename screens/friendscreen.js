import React, { Component } from 'react';
import { RefreshControl, StyleSheet, View, TextInput, Text, TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendsScreen extends Component {

  constructor(props){
    super(props);

    this.state = {
      isLoading: true,
      findFriendsList: [],
      friendsList: [],
      friendRequests: [],
    }
  }

  findFriends = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch("http://192.168.0.56:3333/api/1.0.0/search", {
          'headers': {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            isLoading: false,
            findFriendsList: responseJson
          })
        })
        .catch((error) => {
            console.log(error);
        })
}

getFriends = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch("http://192.168.0.56:3333/api/1.0.0/user/"+id+"/friends", {
          'headers': {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            isLoading: false,
            friendsList: responseJson
          })
        })
        .catch((error) => {
            console.log(error);
        })
}

getFriendRequest = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch("http://192.168.0.56:3333/api/1.0.0/friendrequests", {
          'headers': {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            isLoading: false,
            friendsRequests: responseJson
          })
        })
        .catch((error) => {
            console.log(error);
        })
}

friendDecision = async (friendId, decision) => {
    const value = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    console.log(friendId);
    return fetch("http://192.168.0.56:3333/api/1.0.0/friendrequests/"+friendId, {
          method: decision,
          headers: {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            console.log(response.status);
            if(response.status === 200){
                return response.json()
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })

}

addFriend = async(friendId) => {
    const value = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    console.log(friendId);
    return fetch("http://192.168.0.56:3333/api/1.0.0/user/"+friendId+"/friends", {
          method: 'post',
          headers: {
            'X-Authorization':  value
          }
        })
        .then((response) => {
            console.log(response.status);
            if(response.status === 200){
                return response.json()
            }else{
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
          console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
}

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({isLoading: true})
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
    const value = await AsyncStorage.getItem('@session_token');
    if (value == null) {
        this.props.navigation.navigate('Login');
    }
  };

  render() {

    if (this.state.isLoading){
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Loading...</Text>
        </View>
      );
    }else{
      return (
        <View style={styles.container}>
          <Text style={styles.subtitle}>Find Friends</Text>
          <FlatList
                data={this.state.findFriendsList}
                renderItem={({item}) => (
                    <View>
                      <Text>{item.user_givenname} {item.user_familyname}</Text>
                      <TouchableOpacity style={styles.buttonStyle} onPress={() => this.addFriend(item.user_id.toString())}>
                        <Text>Add</Text>
                      </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item,index) => item.user_id.toString()}
              />
            <Text style={styles.subtitle}>Friend Requests</Text>
            <FlatList
                data={this.state.friendsRequests}
                renderItem={({item}) => (
                    <View>
                      <Text>{item.first_name} {item.last_name}</Text>
                      <TouchableOpacity style={styles.buttonStyle} onPress={() => this.friendDecision(item.user_id.toString(), "POST")}>
                        <Text>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={() => this.friendDecision(item.user_id.toString(), "DELETE")}>
                        <Text>Reject</Text>
                      </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item,index) => item.user_id.toString()}
              />

                <Text style={styles.subtitle}>My Friends</Text>

              <FlatList
                data={this.state.friendsList}
                renderItem={({item}) => (
                    <View>
                      <Text>{item.user_givenname} {item.user_familyname}</Text>
                    </View>
                )}
                keyExtractor={(item,index) => item.user_id.toString()}
              />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 50,
    color: '#1269c7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#1269c7',
    marginBottom: 30,
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
});

export default FriendsScreen;