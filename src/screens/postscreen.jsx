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
      updating: false,
    };
  }

  // When the component mounts check logged in and if editing post load post data
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        text: '',
        draftId: null,
        updating: false,
      });
      this.textInput.clear();
      this.checkLoggedIn();
      // if route params is not undefined it means the user is going to edit their post or draft
      if (this.props.route.params !== undefined) {
        if (this.props.route.params.postId !== undefined) {
          this.getPostData(this.props.route.params.postId);
          this.setState({ updating: true });
        } else if (this.props.route.params.draftId !== undefined) {
          this.setState({ draftId: this.props.route.params.draftId });
          this.getDraft();
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  /* This function clears and resets everything to prevent errors */
  clearEverything = async () => {
    this.setState({ draftId: null, text: '', updating: false });
    this.textInput.clear();
    this.props.navigation.setParams({ draftId: undefined, postId: undefined });
  };

  // This function saves the post as a draft
  createDraft = async () => {
    if (this.state.text.match(/^([A-z\d\s()!?#])+$/)) { // Validation
      let drafts = await AsyncStorage.getItem('drafts');
      // if draft id is not null means we are updating a draft instead
      if (this.state.draftId === null) {
        // if catches it means that there are no drafts
        try {
          // create a draft with an id greater that the last draft
          drafts = JSON.parse(drafts);
          const id = drafts[(drafts.length - 1)].id + 1;
          drafts.push({ text: this.state.text, id });
          await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
        } catch (error) {
          // if no drafts exist initialise the first one
          console.log('No drafts exist');
          drafts = [{ text: this.state.text, id: 0 }];
          await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
        }
      } else {
        const tempDrafts = JSON.parse(await AsyncStorage.getItem('drafts'));
        let pickedOne;
        // find the index of the draft
        tempDrafts.forEach((object, index) => {
          if (object.id === this.state.draftId) {
            pickedOne = index;
          }
        });

        // update the draft text
        tempDrafts[pickedOne].text = this.state.text;
        this.componentDidMount();
        await AsyncStorage.setItem('drafts', JSON.stringify(tempDrafts));
      }
      // clear all the data to so when user presses back on navigation its not saved
      this.clearEverything();
      this.props.navigation.navigate('Drafts');
    } else {
      this.setState({ error: 'Post contains unallowed characters or is empty!' });
    }
  };

  // This function gets the draft
  getDraft = async () => {
    const tempDrafts = JSON.parse(await AsyncStorage.getItem('drafts'));
    let pickedOne;

    // Find the index of the draft
    tempDrafts.forEach((object, index) => {
      if (object.id === this.state.draftId) {
        pickedOne = index;
      }
    });

    this.setState({ text: tempDrafts[pickedOne].text });
  };

  // This class deletes a draft if it gets posted
  deleteDraft = async () => {
    const tempDrafts = JSON.parse(await AsyncStorage.getItem('drafts'));
    let pickedOne = 0;
    // find the index of the picked draft
    tempDrafts.forEach((object, index) => {
      if (object.id === this.state.draftId) {
        pickedOne = index;
      }
    });
    // remove the draft
    tempDrafts.splice(pickedOne, 1);
    await AsyncStorage.setItem('drafts', JSON.stringify(tempDrafts));
    console.log('Deleted draft');
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
          // if post originated from a draft delete the draft
          if (this.state.draftId !== null) {
            this.deleteDraft();
          }
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
            this.clearEverything();
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
          {!this.state.updating ? (
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => this.props.navigation.navigate('Drafts')}
            >
              <Text>Drafts</Text>
            </TouchableOpacity>
          ) : null }
          {!this.state.updating ? (
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => this.createDraft()}
            >
              <Text>Save Draft</Text>
            </TouchableOpacity>
          ) : null }
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => (this.state.updating ? this.updatePost() : this.postData())}
          >
            <Text>{this.state.updating ? 'Update' : 'Create'}</Text>
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
          ref={(input) => { this.textInput = input; }}
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
