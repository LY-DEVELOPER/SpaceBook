import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity} from 'react-native';

class HomeScreen extends Component {

  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.title}>SpaceBook</Text>
        <Text style={styles.subtitle}>Social media thats out of this world!</Text>
        <Text>Welcome User!</Text>
      </View>
    );
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
});

export default HomeScreen;