import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import io from 'socket.io-client';
import url from '../url';

const socket = io.connect(url + '/lobby');

const Lobby = (props) => {
  const [userName, setUserName] = useState(null);
  const [joinRoomNum, setJoinRoomNum] = useState(null);
  const [createRoomNum, setCreateRoomNum] = useState(null);

  useLayoutEffect(() => {
    const { navigation } = props;
    navigation.setOptions({
      headerShown: false,
    });
    
  });

  useEffect(() => {
    // console.log(40, socket);
    socket.emit('welcomeToLobby');

    socket.once('inLobby', (msg) => {
      console.log(42, msg);
    });
  }, []);

  const createRoom = () => {
    console.log(15, 'create room', userName, createRoomNum);

    socket.emit('isRoomExsist', createRoomNum);

    socket.once('answerIfRoomExist', (msg) => {

      if (msg) {
        alert('room allready exist');
        console.log('room allready exist')

      } else {
        console.log('room not exist - so create and move me')

        props.navigation.replace('room', {
          createRoomNum,
          userName,
        });
      }
    });
  };

  const joinRoom = () => {
    console.log(20, 'join room', userName, joinRoomNum);

    socket.emit('isRoomExsist', joinRoomNum);

    socket.once('answerIfRoomExist', (msg) => {

      if (msg) {
        console.log('63, msg', msg)
        props.navigation.replace('room', {
          joinRoomNum,
          userName,
        });
        
      } else {
        alert('room doesnt exist');
        console.log('room doesnt exist')
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.cube}>
        <TextInput
          onChangeText={(e) => setUserName(e)}
          placeholder="שם משתמש"
          style={styles.inputUserName}></TextInput>
      </View>
      <View style={styles.cube}>
        <TextInput
          onChangeText={(e) => setCreateRoomNum(e)}
          placeholder="מס'"
          style={styles.inputText}></TextInput>
        <TouchableOpacity
          onPress={() => {
            createRoom();
          }}
          style={styles.btn}>
          <Text style={styles.textdBtn}>צור חדר</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cube}>
        <TextInput
          onChangeText={(e) => setJoinRoomNum(e)}
          placeholder="מס'"
          style={styles.inputText}></TextInput>
        <TouchableOpacity
          onPress={() => {
            joinRoom();
          }}
          style={styles.btn}>
          <Text style={styles.textdBtn}>הצטרף לחדר</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Lobby;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 100, 200)',
  },
  cube: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
    margin: 6,
    width: '50%',
  },
  inputUserName: {
    alignContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    padding: 3,
    width: '100%',
    fontSize: 22,

    borderRadius: 5,
  },
  btn: {
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 8,
    borderRadius: 15,
  },
  inputText: {
    alignContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    padding: 3,
    width: '25%',
    fontSize: 22,

    borderRadius: 5,
  },

  textdBtn: {
    fontSize: 22,
  },


});
