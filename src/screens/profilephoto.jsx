import React, { Component } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';

class ProfilePhoto extends Component {
  /* This is the profile photo screen
  this class allows a user to take a photo on their camera
  and upload it to the server to be their profile picture */
  constructor(props) {
    super(props);

    this.state = {
      hasPermission: null,
      type: Camera.Constants.Type.front,
    };
  }

  // When component mounts check if the app had permission to use camer else ask for it
  async componentDidMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === 'granted' });
    this.checkLoggedIn();
  }

  // This function uploads the picture to the server
  uploadPicture = async (data) => {
    const authValue = await AsyncStorage.getItem('@session_token');
    const id = await AsyncStorage.getItem('@session_id');
    // Here the image is retrieved as base64 then converted to a blob
    const res = await fetch(data.base64);
    const blob = await res.blob();
    // We then post the image in the body
    return fetch(
      `http://${global.ip}:3333/api/1.0.0/user/${id}/photo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'X-Authorization': authValue,
        },
        body: blob,
      },
    )
      .then(() => {
        // Go back to profile screen when photo has been uploaded
        console.log('Uploaded photo');
        this.props.navigation.navigate('Profile');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // This function captures the photo then sends it to the uploadPicture function
  takePicture = async () => {
    if (this.camera) {
      // Set the quality of the photo and enable base64
      const options = {
        quality: 0.25,
        base64: true,
        onPictureSaved: (data) => this.uploadPicture(data),
      };
      await this.camera.takePictureAsync(options);
    }
  };

  // If the user is not logged in sign out
  checkLoggedIn = async () => {
    const authValue = await AsyncStorage.getItem('@session_token');
    if (authValue == null) {
      await AsyncStorage.removeItem('@session_token');
      await AsyncStorage.removeItem('@session_id');
      this.props.navigation.navigate('Login');
    }
  };

  // Here we are rendering the camera and the buttons to take a photo and to flip the camera
  render() {
    if (this.state.hasPermission) {
      return (
        <View style={styles.container}>
          <Camera
            style={styles.camera}
            type={this.state.type}
            ref={(ref) => { this.camera = ref; }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={(state = this.state) => {
                  const type = state.type === Camera.Constants.Type.back.toString()
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back;

                  this.setState({ type });
                }}
              >
                <Text> Flip </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={() => {
                  this.takePicture();
                }}
              >
                <Text> Take Photo </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
    return <Text>No access to camera</Text>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    marginBottom: 10,
    backgroundColor: '#1269c7',
    alignItems: 'center',
    borderWidth: 2,
    padding: 5,
    margin: '1%',
    width: '100%',
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default ProfilePhoto;
