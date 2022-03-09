import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Posts from '../components/posts';

class HomeScreen extends Component {
  /* This is the Home screen class it is where the buttons
  to access the other pages are located and it shows the
  posts of all the users friends using the post component */

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  // When component mounts check user is logged in
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ isLoading: true });
      this.checkLoggedIn();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // Logs the user out and clears the storage
  logOut = async () => {
    await AsyncStorage.removeItem('@session_token');
    await AsyncStorage.removeItem('@session_id');
    this.props.navigation.navigate('Login');
  };

  // Check wether user is logged in
  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      this.props.navigation.navigate('Login');
    } else {
      this.setState({ isLoading: false });
    }
  };

  /* Render in the home screen with the navigation buttons and
  post component once it is done loading */
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
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SpaceBook</Text>
        <Text style={styles.subtitle}>
          Social media thats out of this world!
        </Text>
        <View style={{ flexDirection: 'row', width: 300, justifyContent: 'center' }}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.props.navigation.navigate('Profile')}
          >
            <Text>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.props.navigation.navigate('Post')}
          >
            <Text>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.props.navigation.navigate('Friends')}
          >
            <Text>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => this.logOut()}
          >
            <Text>Log Out</Text>
          </TouchableOpacity>
        </View>
        <Posts style={styles.posts} navigation={this.props.navigation} />
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
    alignSelf: 'center',
    width: '100%',
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
  tabButton: {
    margin: 3,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 5,
    width: '25%',
  },
});

export default HomeScreen;
