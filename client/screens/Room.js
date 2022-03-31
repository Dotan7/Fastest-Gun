import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import io from 'socket.io-client';
import url from '../url';

import PlayerX from '../comps/PlayerX';
import PopUp from '../comps/PopUp';

const socket = io.connect(url + '/room');

const Room = (props) => {
  const [roomNum, setRoomNum] = useState(
    props.route.params.createRoomNum
      ? props.route.params.createRoomNum
      : props.route.params.joinRoomNum
  );

  const [admin, setAdmin] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [whosInRoom, setWhosInRoom] = useState(null);
  const [fresh, setFresh] = useState(false);
  const [adminPop, setAdminPop] = useState(false);
  const [someoneJoinTheRoomPop, setSomeoneJoinTheRoomPop] = useState(false);

  useLayoutEffect(() => {
    const { navigation } = props;
    navigation.setOptions({
      headerShown: false,
    });
  });

  useEffect(() => {
    // console.log('room props: ', props.route.params);
  }, []);

  useEffect(() => {
    socket.emit(
      'joinRoom',
      props.route.params.userName,
      props.route.params.createRoomNum
        ? props.route.params.createRoomNum
        : props.route.params.joinRoomNum
    );
  }, []);

  useEffect(() => {
    socket.once('meEnteredRoom', (rest, me) => {
      console.log(55, 'me:', me);
      console.log(56, 'rest', rest);

      if (rest.length > 0) {
        setWhosInRoom([...rest, me]);

        rest.map((player) => {
          if (player.admin) {
            setAdmin(player);
          }

          if (player.opponent) {
            setOpponent(player);
          }
        });
      } else {
        // alert('youre the first in the room and admin');
        console.log('youre the first in the room and admin');
        setAdmin(me);
        setWhosInRoom([me]);
        setAdminPop(true);
      }
    });

    socket.on('someoneEnteredAndNewRoom', (oldRoomPlayres, newUserInRoom) => {
      console.log('someoneEnteredAndNewRoom', oldRoomPlayres, newUserInRoom);
      setWhosInRoom([...oldRoomPlayres, newUserInRoom]);
      // alert(newUserInRoom.userName + ' Entered the room');
      setSomeoneJoinTheRoomPop(true);
    });

    socket.on('setUpOpponentOnFront', (player) => {
      console.log('setUpOpponentOnFront111:', player);
      console.log('whosInRoom222', whosInRoom);

      if (whosInRoom) {
        whosInRoom.map((pla, ind) => {
          console.log('map for oppo - ', ind, pla);
          if (pla.id === player.id) {
            pla.opponent = true;
            setOpponent(pla);
            setFresh(!fresh);
            console.log('--------kkkk', player);
            console.log('whosInRoom MUST', whosInRoom);
          }
        });
      }
    });
  }, [whosInRoom]);

  const setUpOpponent = () => {
    socket.emit('setUpOpponentForServer', roomNum);
  };

  return (
    <>
      {whosInRoom
        ? whosInRoom.map((player, i) => {
            if (player.id === socket.id) {
              return (
                <>
                  <PlayerX
                    player={player}
                    playerNum={i + 1}
                    socket={socket}
                    whosInRoom={whosInRoom}
                    admin={admin}
                    roomNum={roomNum}
                    opponent={opponent}
                    setUpOpponent={setUpOpponent}
                    navigation={props.navigation}
                  />
                </>
              );
            }
          })
        : null}

      {adminPop ? (
        <PopUp
          setShow={setAdminPop}
          showTime={3}
          msgA={'YOU ARE THE FIRST IN THE ROOM AND ADMIN'}
          msgAFontSize={18}
        />
      ) : null}

      {someoneJoinTheRoomPop ? (
        <PopUp
        
          setShow={setSomeoneJoinTheRoomPop}
          showTime={3}
          msgA={`${whosInRoom[whosInRoom.length - 1].userName} Entered the room`}
        />
        
      ) : null}
    </>
  );
};

export default Room;

const styles = StyleSheet.create({});
