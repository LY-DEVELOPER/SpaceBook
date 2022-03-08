import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Posts from '../components/posts';

class ProfileScreen extends Component {
  /* This is the profile screen, this class loads
  the users profile or other users profile and their
  posts and also lets the user edit their profile */

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      user_id: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      profilePic: null,
      edit: false,
    };
  }

  // When component mounts run the neccessary functions
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ isLoading: true });
      this.checkLoggedIn();
      this.getUserData();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // This function gets the users data for the profile
  getUserData = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    let id = await AsyncStorage.getItem('@session_id');
    // If route params is not undefined it means we want to load another users profile
    if (this.props.route.params !== undefined) { id = this.props.route.params.selectedId; }
    await this.getUserProfile(authValue, id);
    return fetch(`http://${global.ip}:3333/api/1.0.0/user/${id}`, {
      headers: {
        'X-Authorization': authValue,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        this.logOut();
        throw response.status;
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          first_name: responseJson.first_name,
          last_name: responseJson.last_name,
          email: responseJson.email,
          user_id: responseJson.user_id,
        });
        console.log('Retrieved data of user');
        console.log('Finished Loading profile Screen');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function gets the profile picture of the user
  getUserProfile = async (authValue, id) => fetch(
    `http://${global.ip}:3333/api/1.0.0/user/${id}/photo`,
    {
      method: 'GET',
      headers: {
        'X-Authorization': authValue,
      },
    },
  )
    .then((response) => response.blob()) // here we convert the body to a blob object
    .then((res) => {
      // here we are converting it to a url that the render can access
      const data = URL.createObjectURL(res);
      this.setState({
        profilePic: data,
      });
      console.log('Retrieved Photo');
    })
    .catch((error) => {
      console.log(error);
    });

  // This function updates the users data or password
  updateUser = async (password) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    let data;
    // If we want to update just the user info set data to user info or password
    if (!password) {
      data = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
      };
    } else {
      data = { password: this.state.password };
    }

    // upload the data
    return fetch(`http://${global.ip}:3333/api/1.0.0/user/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': authValue,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Updated user');
          this.setState({ password: '', edit: false });
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // If we are not logged in log out
  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      await AsyncStorage.removeItem('@session_token');
      await AsyncStorage.removeItem('@session_id');
      this.props.navigation.navigate('Login');
    }
  };

  // Here we render the users profile with their posts or if editing we render text boxs to edit
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
    } if (this.props.route.params === undefined && this.state.edit === true) {
      return (
        <View style={styles.container}>
          <Image
            source={{ uri: this.state.profilePic }}
            style={{
              width: 200,
              height: 200,
              borderWidth: 5,
              borderRadius: 200,
            }}
          />
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.props.navigation.navigate('ProfilePhoto')}
          >
            <Text>Take Profile Picture</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.TextInput}
            placeholder="firstname"
            placeholderTextColor="#115297"
            onChangeText={(first_name) => this.setState({ first_name })}
            value={this.state.first_name}
          />
          <TextInput
            style={styles.TextInput}
            placeholder="lastname"
            placeholderTextColor="#115297"
            onChangeText={(last_name) => this.setState({ last_name })}
            value={this.state.last_name}
          />
          <TextInput
            style={styles.TextInput}
            placeholder="email"
            placeholderTextColor="#115297"
            onChangeText={(email) => this.setState({ email })}
            value={this.state.email}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.updateUser(false)}
          >
            <Text>Save Changes</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.TextInput}
            placeholder="password"
            placeholderTextColor="#115297"
            secureTextEntry
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.updateUser(true)}
          >
            <Text>Update Password</Text>
          </TouchableOpacity>
        </View>
      );
    } if (this.props.route.params === undefined) {
      return (
        <View style={styles.container}>
          <Image
            source={{ uri: this.state.profilePic }}
            style={{
              width: 200,
              height: 200,
              borderWidth: 5,
              borderRadius: '100%',
            }}
          />
          <Text>
            {this.state.first_name}
            {' '}
            {this.state.last_name}
          </Text>
          <Text>{this.state.email}</Text>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.setState({ edit: true })}
          >
            <Text>Edit Profile</Text>
          </TouchableOpacity>
          <Posts selectedId={this.state.user_id} />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: this.state.profilePic }}
          style={{
            width: 200,
            height: 200,
            borderWidth: 5,
            borderRadius: '100%',
          }}
        />
        <Text>
          {this.state.first_name}
          {' '}
          {this.state.last_name}
        </Text>
        <Text>{this.state.email}</Text>
        <Posts selectedId={this.state.user_id} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    color: '#1269c7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#1269c7',
    marginBottom: 15,
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
    margin: 3,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: '23%',
  },
  TextInput: {
    borderWidth: 1,
    borderColor: 'black',
    width: 300,
    marginTop: 10,
    padding: 5,
    color: '#1269c7',
  },
});

export default ProfileScreen;
