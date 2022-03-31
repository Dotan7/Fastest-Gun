import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import url from '../url';

const socket = io.connect(url + '/home');

const Home = (props) => {
  useLayoutEffect(() => {
    const { navigation } = props;
    navigation.setOptions({
      
      headerShown: false,
    });
  });

  useEffect(() => {
    socket.emit('welcomeToServer');

    socket.once('welcome', (msg) => {
      
      console.log(20, 'welcomeToServer', msg);
      
    });
    
  }, []);

  const enterGame = () => {
    props.navigation.replace('lobby', {
      // id,
      // data: 'LIST',
    });
  };
  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          enterGame();
        }}>
        <Text style={styles.textdBtn}>כניסה למשחק</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(13, 202, 240)',
  },
  btn: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    padding: 6,
    width: '50%',

    borderRadius: 50,
  },

  textdBtn: {
    fontSize: 18,
  },
});
