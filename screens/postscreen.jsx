import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PostScreen extends Component {
  /* This is the post screen this class is where the user
  can create or edit their posts */
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  // When the component mounts check logged in and if editing post load post data
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      // if route params is not undefined it means the user is going to edit their post
      if (this.props.route.params !== undefined) {
        this.getPostData(this.props.route.params.postId);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // Send the post to the server
  postData = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/post`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authValue,
        },
        body: JSON.stringify({
          text: this.state.text,
        }),
      },
    )
      .then((response) => {
        console.log();
        if (response.status === 201) {
          return response.json();
        }
        throw response.status;
      })
      .then((responseJson) => {
        console.log('Post Created with ID: ', responseJson);
        this.props.navigation.navigate('Home');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // update the post to the server
  updatePost = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    const { postId } = this.props.route.params;
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/post/${postId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authValue,
        },
        body: JSON.stringify({
          text: this.state.text,
        }),
      },
    )
      .then((response) => {
        if (response.status === 200) {
          this.props.navigation.navigate('Home');
        }
        throw response.status;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // get the post from the server so the user can edit it
  getPostData = async (postId) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/post/${postId}`,
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
        this.setState({
          text: responseJson.text,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // check if user is logged in else log them out
  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      await AsyncStorage.removeItem('@session_token');
      await AsyncStorage.removeItem('@session_id');
      this.props.navigation.navigate('Login');
    }
  };

  /* Depending on if route params has been defined (means user is editing the post)
  show a text input with a create or update button */
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() =>
            (this.props.route.params !== undefined ? this.updatePost() : this.postData())}
        >
          <Text>{this.props.route.params !== undefined ? 'Update' : 'Create'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Your text here"
          placeholderTextColor="#115297"
          onChangeText={(text) => this.setState({ text })}
          value={this.state.text}
          numberOfLines={4}
          multiline
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
    justifyContent: 'flex-start',
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
  textInput: {
    textAlignVertical: 'top',
    borderTopWidth: 1,
    width: '100%',
    marginTop: 10,
    padding: 5,
    height: '100%',
    color: '#1269c7',
  },
});

export default PostScreen;
