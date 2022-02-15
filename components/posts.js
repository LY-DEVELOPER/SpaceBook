import React, { Component } from 'react';
import { RefreshControl, StyleSheet, View, TextInput, Text, TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Posts extends Component {

    constructor(props){
        super(props);
    
        this.state = {
          friendList: [],
          postList: [],
        }
      }

    getFriends = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        const id = await AsyncStorage.getItem('@session_id');
        return fetch("http://localhost:3333/api/1.0.0/user/"+id+"/friends", {
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
              this.setState({
                friendList: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    getData = async () => {
        const value = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/search", {
              'headers': {
                'X-Authorization':  value
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return response.json()
                }else if(response.status === 401){
                  this.props.navigation.navigate("Login");
                }else{
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
              this.setState({
                isLoading: false,
                listData: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
      }
    

}

export default Posts;