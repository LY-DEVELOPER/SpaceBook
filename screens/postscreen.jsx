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
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      if (this.props.route.params !== undefined) {
        this.getPostData(this.props.route.params.postId);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  postData = async () => {
    // Validation here...
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

  updatePost = async () => {
    // Validation here...
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

  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      this.props.navigation.navigate('Login');
    }
  };

  render() {
    if (this.props.route.params !== undefined) {
      return (
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="post"
            placeholderTextColor="#115297"
            onChangeText={(text) => this.setState({ text })}
            value={this.state.text}
            numberOfLines={4}
            multiline
          />
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.updatePost()}
          >
            <Text>Update</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="post"
          placeholderTextColor="#115297"
          onChangeText={(text) => this.setState({ text })}
          value={this.state.text}
          numberOfLines={4}
          multiline
        />
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.postData()}
        >
          <Text>Post</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: 300,
  },
  textInput: {
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'black',
    width: 300,
    marginTop: 10,
    padding: 5,
    height: '30%',
    color: '#1269c7',
  },
});

export default PostScreen;
