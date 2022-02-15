import React, { Component } from 'react';
import { RefreshControl, StyleSheet, View, TextInput, Text, TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PostScreen extends Component {

  constructor(props){
    super(props);

    this.state = {
      isLoading: true,
      isEditing: false,
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({isLoading: true})
      this.checkLoggedIn();
      this.getUserData();

      if(isEditing){
        this.getPostData
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getPostData = async () => {

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
    }else if(this.state.isEditing){

    }else{
      return (
        <View style={styles.container}>
          <Text style={styles.title}>SpaceBook</Text>
          <Text style={styles.subtitle}>Social media thats out of this world!</Text>
          <Text>Hey {this.state.userName}!</Text>
          <TouchableOpacity style={styles.buttonStyle} onPress={() => this.logOut()}>
            <Text>Log Out</Text>
          </TouchableOpacity>
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

export default PostScreen;