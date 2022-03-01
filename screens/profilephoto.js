import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";

class ProfilePhoto extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasPermission: null,
      type: Camera.Constants.Type.front,
    };
  }

  async componentDidMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === "granted" });
    this.checkLoggedIn();
  }

  uploadPicture = async (data) => {
    const value = await AsyncStorage.getItem("@session_token");
    const id = await AsyncStorage.getItem("@session_id");
    console.log("ey");
    let res = await fetch(data.base64);
    let blob = await res.blob();

    return fetch("http://"+global.ip+":3333/api/1.0.0/user/" + id + "/photo", {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        "X-Authorization": value,
      },
      body: blob,
    })
      .then((response) => {
        console.log("Uploaded photo");
      })
      .then(() => {
        this.props.navigation.navigate("Profile");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  takePicture = async () => {
    if (this.camera) {
      const options = {
        quality: 0.5,
        base64: true,
        onPictureSaved: (data) => this.uploadPicture(data),
      };

      await this.camera.takePictureAsync(options);
    }
  };

  logOut = async () => {
    await AsyncStorage.removeItem("@session_token");
    await AsyncStorage.removeItem("@session_id");
    this.props.navigation.navigate("Login");
  };

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem("@session_token");
    if (value == null) {
      this.props.navigation.navigate("Login");
    }
  };

  render() {
    if (this.state.hasPermission) {
      return (
        <View style={styles.container}>
          <Camera
            style={styles.camera}
            type={this.state.type}
            ref={(ref) => (this.camera = ref)}
          >
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={() => {
                  let type =
                    this.state.type == Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back;

                  this.setState({ type: type });
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
    } else {
      return <Text>No access to camera</Text>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStyle: {
    marginBottom: 10,
    backgroundColor: "#1269c7",
    alignItems: "center",
    borderWidth: 2,
    padding: 5,
    margin: "1%",
    width: "33%",
  },
  camera: {
    flex: 1,
    aspectRatio: 12/16,
    height: "auto",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

export default ProfilePhoto;
