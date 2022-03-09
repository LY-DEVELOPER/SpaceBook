import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftScreen extends Component {
  /* This is the draft screen this is where the user
  can view all their drafts and edit them */

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      drafts: [],
    };
  }

  // When component mounts set the states and call the initial functions
  componentDidMount() {
    this.setState({
      isLoading: true,
      drafts: [],
    });
    this.getDrafts();
  }

  // This function retrieves that drafts from memory
  getDrafts = async () => {
    const tempDrafts = await AsyncStorage.getItem('drafts');
    // if catches means that there are no drafts
    try {
      JSON.parse(tempDrafts);
      this.setState({ drafts: JSON.parse(tempDrafts) });
      this.setState({ isLoading: false });
    } catch (error) {
      console.log('Drafts dont exists');
    }
  };

  // This function deletes a post
  deletePost = async (id) => {
    const tempDrafts = this.state.drafts;
    let pickedOne = 0;
    // find the index of the picked draft
    tempDrafts.forEach((object, index) => {
      if (object.id === id) {
        console.log(object.id);
        console.log(index);
        pickedOne = index;
      }
    });
    // remove the draft
    tempDrafts.splice(pickedOne, 1);
    await AsyncStorage.setItem('drafts', JSON.stringify(tempDrafts));
    this.componentDidMount();
  };

  render() {
    if (this.state.drafts !== [] && this.state.isLoading === false) {
      return (
        <View style={styles.container}>
          <FlatList
            data={this.state.drafts}
            renderItem={({ item }) => (
              <View style={styles.post}>
                <Text style={styles.text}>
                  Time to Post -
                </Text>
                <Text style={styles.postText}>{item.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => this.props.navigation.navigate('Post', {
                      draftId: item.id,
                    })}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => this.deletePost(item.id)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text>No drafts to load</Text>
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

export default DraftScreen;
