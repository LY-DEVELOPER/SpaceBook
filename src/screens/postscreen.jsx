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
      error: '',
      draftId: null,
    };
  }

  // When the component mounts check logged in and if editing post load post data
  componentDidMount() {
    this.setState({
      text: '',
      draftId: null,
    });
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      // if route params is not undefined it means the user is going to edit their post or draft
      if (this.props.route.params !== undefined) {
        if (this.props.route.params.postId !== undefined) {
          this.getPostData(this.props.route.params.postId);
        } else {
          this.setState({ draftId: this.props.route.params.draftId });
          this.getDraft();
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // This function saves the post as a draft
  createDraft = async () => {
    let drafts = await AsyncStorage.getItem('drafts');
    console.log(drafts);
    // if draft id is not null means we are updating a draft instead
    if (this.state.draftId === null) {
      // if catches it means that there are no drafts
      try {
        // create a draft with an id greater that the last draft
        drafts = JSON.parse(drafts);
        const id = drafts[(drafts.length - 1)].id + 1;
        drafts.push({ text: this.state.text, id });
        await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
        this.props.navigation.navigate('Drafts');
      } catch (error) {
        // if no drafts exist initialise the first one
        console.log('No drafts exist');
        drafts = [{ text: this.state.text, id: 0 }];
        await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
        this.props.navigation.navigate('Drafts');
      }
    } else {
      const tempDrafts = JSON.parse(await AsyncStorage.getItem('drafts'));
      let pickedOne;
      // find the index of the draft
      tempDrafts.forEach((object, index) => {
        if (object.id === this.state.draftId) {
          console.log(object.id);
          console.log(index);
          pickedOne = index;
        }
      });

      // update the draft text
      tempDrafts[pickedOne].text = this.state.text;
      this.componentDidMount();
      await AsyncStorage.setItem('drafts', JSON.stringify(tempDrafts));
      this.props.navigation.navigate('Drafts');
    }
  };

  // This function gets the draft
  getDraft = async () => {
    const tempDrafts = JSON.parse(await AsyncStorage.getItem('drafts'));
    let pickedOne;

    // Find the index of the draft
    tempDrafts.forEach((object, index) => {
      if (object.id === this.state.draftId) {
        console.log(object.id);
        console.log(index);
        pickedOne = index;
      }
    });

    this.setState({ text: tempDrafts[pickedOne].text });
  };

  // Send the post to the server
  postData = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    if (this.state.text.match(/^([A-z\d\s()!?#])+$/)) { // Validation
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
          this.setState({ error: 'Post could not be sent' });
          throw response.status;
        })
        .then((responseJson) => {
          console.log('Post Created with ID: ', responseJson);
          this.props.navigation.navigate('Home');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.setState({ error: 'Post contains unallowed characters or is empty!' });
    return null;
  };

  // update the post to the server
  updatePost = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    const { postId } = this.props.route.params;
    if (this.state.text.match(/^([A-z\d\s()!?#])+$/)) { // Validation
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
          this.setState({ error: 'Post could not be updated' });
          throw response.status;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.setState({ error: 'Post contains unallowed characters or is empty!' });
    return null;
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
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.props.navigation.navigate('Drafts')}
          >
            <Text>Drafts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => this.createDraft()}
          >
            <Text>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() =>
              (this.props.route.params !== undefined ? this.updatePost() : this.postData())}
          >
            <Text>{this.props.route.params !== undefined ? 'Update' : 'Create'}</Text>
          </TouchableOpacity>
        </View>
        <Text>{this.state.error}</Text>
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
    margin: 5,
    marginTop: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    width: '30%',
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
