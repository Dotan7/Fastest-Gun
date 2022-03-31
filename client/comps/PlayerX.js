import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PopUp from './PopUp';

const TimeBox = (props) => {
  // console.log(10, props);
  return (
    <View style={styles.timeBox}>
      {props.gameOn ? (
        <Text style={styles.timeText}>{props.time}</Text>
      ) : !props.opponent ? (
        <Text style={styles.timeText}>Waiting for Opponent</Text>
      ) : !props.oppoReady ? (
        <Text style={styles.timeText}>Opponent not ready</Text>
      ) : props.oppoReady ? (
        <Text style={styles.timeText}>waiting to start game</Text>
      ) : null}
    </View>
  );
};

const Player = (props) => {
  
  const socket = props.socket;
  const [playerAction, setPlayerAction] = useState(props.player.userName);
  const [enemyPhotoUrl, setEnemyPhotoUrl] = useState(null);
  const [enemyAction, setEnemyAction] = useState();
  const [ready, setReady] = useState(false);
  const [oppoReady, setOppoReady] = useState(false);
  const [shots, setShots] = useState(0);
  const [visionPhoto, setVisionPhoto] = useState(null);
  const [time, setTime] = useState(null);
  const [gameOn, setGameOn] = useState(null);
  const [stopTime, setStopTime] = useState(false);
  const [youWin, setYouWin] = useState(false);
  const [youLose, setYouLose] = useState(false);
  const [endQuest, setEndQuest] = useState(`Play again Vs same Opponent?`);
  const [startGamePop, setStartGamePop] = useState(false);

  const [shootUri, setShootUri] = useState(
    'https://i.pinimg.com/564x/56/36/9c/56369ca02d34235ee80cf9cc17d50024.jpg'
  );
  const [noBulletsUri, setNoBulletsUri] = useState(
    'https://image.shutterstock.com/image-vector/no-bullet-vector-not-allow-600w-1716782407.jpg'
  );
  const [shieldUri, setShieldUri] = useState(
    'https://media.istockphoto.com/vectors/shield-and-sword-icon-vector-logo-design-template-vector-id1266892400?k=20&m=1266892400&s=612x612&w=0&h=16vSXnLy4i7nivsz7sNq3urQR58RjsCrGoD0znwO-eQ='
  );
  const [loadUri, setLoadUri] = useState(
    'https://studio.cults3d.com/GCXI_07hRZMBZfP0mz_vC-9wB7Q=/516x516/https://files.cults3d.com/uploaders/17095243/illustration-file/f42ca2d6-5570-4a34-ba5e-0a8828a79220/bullet.png'
  );

  useEffect(() => {
    let runTime;
    if (time > 0) {
      runTime = setInterval(() => {
        setTime(time - 1);
      }, 1000);
    }

    return () => {
      clearInterval(runTime);
    };
  }, [time]);

  useEffect(() => {
    socket.on('opponentIsReady', () => {
      console.log('READY!!!!');
      setOppoReady(true);
    });

    socket.on('setTimeToThree', (data) => {
      setGameOn(true);
      setStartGamePop(true);

      setTimeout(() => {
        setStartGamePop(false);
        setTime(3);
      }, 3000);
    });

    socket.on('rivalAction', (action) => {
      console.log(102102, action);
      setRivalActionFunc(action);
    });

    socket.on('adminWinFromServer', () => {
      setStopTime(true);
      setYouWin(true);
    });

    socket.on('adminLoseFromServer', () => {
      setStopTime(true);
      setYouLose(true);
    });

    socket.on('wantRematch', (player, roomId, admin, opponent) => {
      console.log(135, 'rival want rematch');

      if (endQuest === `Play again Vs same Opponent?`) {
        if (props.player.admin) {
          setEndQuest(
            `${opponent.userName} Challenge you to a rematch. Accept?`
          );
        }

        if (props.player.opponent) {
          setEndQuest(`${admin.userName} Challenge you to a rematch. Accept?`);
        }
      }
    });

    socket.on('startNewRoundWithSamePlayersFromServer', () => {
      console.log('starting New Round With Same Players From Server:');

      setPlayerAction(props.player.userName);
      setEnemyPhotoUrl();
      setShots(0);
      setVisionPhoto(null);
      setTime(null);
      setStopTime(false);
      setYouWin(false);
      setYouLose(false);
      setEndQuest(`Play again Vs same Opponent?`);
      setStartGamePop(false);

      socket.emit('startGame', props.roomNum);
    });

    socket.on('wentToLobbyFromServer', (player, admin, opponent) => {
      console.log(
        147,
        'rival wentToLobbyFromServer: ',
        player,
        admin,
        opponent
      );
      wentToLobbyFromServerFunc(player, admin, opponent);

    });
  }, []);

  useEffect(() => {
    if (time === 0) {
      checkWinner();

      setTimeout(() => {
        if (!stopTime) {
          setTime(3);
        } else {
          setTime(null);
        }
      }, 1000);
    }

    if (time === 3) {
      setVisionPhoto(null);
      setEnemyPhotoUrl(null);
      setPlayerAction("didn't pick");
      socket.emit(
        'sendMyActionToServer',
        props.player,
        props.roomNum,
        "didn't pick",
        props.admin,
        props.opponent
      );
    }
  }, [time]);

  const imReady = (admin) => {
    socket.emit('imReady', admin);
    setReady(true);
  };

  const startGame = (roomId) => {
    if (oppoReady) {
      socket.emit('startGame', roomId);
    }
  };

  const backToLobby = () => {
    socket.emit(
      'wentToLobby',
      props.player,
      props.roomNum,
      props.admin,
      props.opponent
    );

    props.navigation.replace('lobby', {
      // id,
      // data: 'LIST',
    });
  };

  const setRivalActionFunc = (action) => {
    if (action === 'shield') {
      setEnemyPhotoUrl({
        uri: shieldUri,
      });
    } else if (action === 'load') {
      setEnemyPhotoUrl({
        uri: loadUri,
      });
    } else if (action === 'shoot') {
      setEnemyPhotoUrl({
        uri: shootUri,
      });
    }
    setEnemyAction(action);
  };

  const wentToLobbyFromServerFunc = (player, admin, opponent) => {
    console.log(236, 'wentToLobbyFromServerFunc: ', player, admin, opponent);

    if (player.id === admin.id) {
      setEndQuest(`${opponent.userName} Has left the game`);
      console.log(245, 'player === admin');
    }
    if (player.id === opponent.id) {
      setEndQuest(`${admin.userName} Has left the game`);
      console.log(250, 'player === opponent');
    }

     socket.emit(
      'wentToLobby',
      null,
      props.roomNum,
      null,
      null
    );

    setTimeout(() => {
      props.navigation.replace('lobby', {
        // id,
        // data: 'LIST',
      });
    }, 1000);
  };

  const reMatch = () => {
    if (endQuest === `Play again Vs same Opponent?`) {
      socket.emit(
        'rematch',
        props.player,
        props.roomNum,
        props.admin,
        props.opponent
      );
      if (props.player.admin) {
        setEndQuest(`Waiting for response from ${props.opponent.userName}`);
      }

      if (props.player.opponent) {
        setEndQuest(`Waiting for response from ${props.admin.userName}`);
      }
    } else if (endQuest.includes(`Challenge you to a rematch`)) {
      socket.emit('startNewRoundWithSamePlayers', props.roomNum);
    }
  };

  const setActioFunc = (player, action, admin, opponent) => {
    console.log('kfkfkfkfkfkf:', admin, opponent);
    if (action === 'shoot' && shots === 0) {
      action = "didn't pick";
      setVisionPhoto({
        uri: noBulletsUri,
      });
    } else {
      setPlayerAction(action);

      if (action === 'shield') {
        setVisionPhoto({
          uri: shieldUri,
        });
      } else if (action === 'load') {
        setVisionPhoto({
          uri: loadUri,
        });
      } else if (action === 'shoot') {
        setVisionPhoto({
          uri: shootUri,
        });
      }
    }
    socket.emit(
      'sendMyActionToServer',
      player,
      props.roomNum,
      action,
      admin,
      opponent
    );
  };

  const checkWinner = () => {
    console.log('kokokokokokoko');

    if (playerAction === "didn't pick") {
      if (enemyAction === 'shoot') {
        // i loose
        setStopTime(true);

        socket.emit('adminLose', props.roomNum); 
        console.log('adminLose 183');
      }
    }

    if (playerAction === 'shoot') {
      if (shots > 0) {
        setShots(shots - 1);

        if (enemyAction === "didn't pick") {
          // i win
          setStopTime(true);
          socket.emit('adminWin', props.roomNum);
          console.log('adminWin 192');
        }

        if (enemyAction === 'load') {
          // i win
          setStopTime(true);
          socket.emit('adminWin', props.roomNum);
          console.log('adminWin 196');
        }
      } else {
        // i dont have shots
        setPlayerAction('admin - you shoot with no shots');
      }
    }
    if (playerAction === 'load') {
      setShots(shots + 1);

      if (enemyAction === 'shoot') {
        // i loose
        setStopTime(true);

        socket.emit('adminLose', props.roomNum);
        console.log('adminLose 208');
      }
    }
    if (playerAction === 'shield') {
      // console.log('my action', 'shield');
    }
  };

  return (
    <View style={styles.player}>
      <View style={styles.topRawEnemyDetails}>
        {props.player.admin ? (
          !props.opponent ? (
            <Text style={styles.topRawEnemyDetailsText}>
              Waiting for Opponent
            </Text>
          ) : (
            <Text style={styles.topRawEnemyDetailsText}>
              {props.opponent.userName}
            </Text>
          )
        ) : !props.admin ? (
          <Text style={styles.topRawEnemyDetailsText}>
            no need for this text to show
          </Text>
        ) : (
          <Text style={styles.topRawEnemyDetailsText}>
            {props.admin.userName}
          </Text>
        )}
      </View>

      <View style={[styles.enemyPlayerVision]}>
        {props.player.admin ? (
          time === 0 ? (
            <ImageBackground
              source={enemyPhotoUrl}
              resizeMode="cover"
              style={styles.playerVisionImage}>
              <Text style={styles.myPlayerVisionInText}>{enemyAction}</Text>
            </ImageBackground>
          ) : !props.opponent ? (
            <Text style={styles.enemyPlayerVisionInText}>
              Waiting for Opponent
            </Text>
          ) : (
            <Text style={styles.enemyPlayerVisionInText}>
              {props.opponent.userName}
            </Text>
          )
        ) : !props.admin ? (
          <Text style={styles.enemyPlayerVisionInText}>
            no need for this text to show
          </Text>
        ) : time === 0 ? (
          <ImageBackground
            source={enemyPhotoUrl}
            resizeMode="cover"
            style={styles.playerVisionImage}>
            <Text style={styles.myPlayerVisionInText}>{enemyAction}</Text>
          </ImageBackground>
        ) : (
          <Text style={styles.enemyPlayerVisionInText}>
            {props.admin.userName}
          </Text>
        )}
      </View>

      <View style={[styles.timeRow]}>
        <TimeBox
          time={time}
          opponent={props.opponent}
          oppoReady={oppoReady}
          gameOn={gameOn}
        />
      </View>

      <View style={[styles.myPlayerVision]}>
        {props.player.admin || props.player.opponent ? (
          <ImageBackground
            source={visionPhoto}
            resizeMode="cover"
            style={styles.playerVisionImage}>
            <Text style={styles.myPlayerVisionInText}>
              {playerAction !== "didn't pick" ? playerAction : 'TAKE ACTION'}
            </Text>
          </ImageBackground>
        ) : !props.opponent ? (
          <TouchableOpacity
            style={[
              styles.myPlayerVisionBtnToOpponent,
              { borderColor: 'green' },
            ]}
            onPress={() => {
              props.setUpOpponent();
            }}>
            <Text style={styles.myPlayerVisionInText}>Push To Sit</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.myPlayerVisionInText}>
            {props.opponent.userName}
          </Text>
        )}
      </View>

      {!props.player.admin && !props.player.opponent ? null : (
        <View style={styles.btnsContainer}>
          <TouchableOpacity
            onPress={() => {
              setActioFunc(props.player, 'shield', props.admin, props.opponent);
            }}
            style={[
              styles.powerBtn,
              {
                backgroundColor:
                  playerAction === 'shield' ? 'rgb(13, 202, 240)' : null,
                borderColor:
                  playerAction === 'shield' ? 'white' : 'rgb(13, 202, 240)',
              },
            ]}>
            <Text style={styles.textInPowerBtn}>Shield</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActioFunc(props.player, 'shoot', props.admin, props.opponent);
            }}
            style={[
              styles.powerBtn,
              {
                backgroundColor:
                  playerAction === 'shoot' ? 'rgb(13, 202, 240)' : null,
                borderColor:
                  playerAction === 'shoot' ? 'white' : 'rgb(13, 202, 240)',
              },
            ]}>
            <Text style={styles.textInPowerBtn}>Shoot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActioFunc(props.player, 'load', props.admin, props.opponent);
            }}
            style={[
              styles.powerBtn,
              {
                backgroundColor:
                  playerAction === 'load' ? 'rgb(13, 202, 240)' : null,
                borderColor:
                  playerAction === 'load' ? 'white' : 'rgb(13, 202, 240)',
              },
            ]}>
            <Text style={styles.textInPowerBtn}>Load</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPlayerRow}>
        {props.player.admin || props.player.opponent ? (
          <>
            <Text style={styles.bottomPlayerRowUserNameText}>
              {props.player.userName}
            </Text>

            <>
              <Text style={styles.bottomPlayerRowShotCounterText}>
                shots: {shots}
              </Text>
            </>

            <>
              {props.player.opponent ? (
                ready ? (
                  <View
                    style={[
                      styles.readyOrNotCont,
                      { backgroundColor: 'green' },
                    ]}>
                    <Text style={styles.readyOrNotText}>ready</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      imReady(props.admin);
                    }}
                    style={[styles.readyOrNotCont, { backgroundColor: 'red' }]}>
                    <Text style={styles.readyOrNotText}>NOT ready</Text>
                  </TouchableOpacity>
                )
              ) : null}

              {props.player.admin ? (
                ready ? (
                  <View
                    style={[
                      styles.readyOrNotCont,
                      { backgroundColor: 'green' },
                    ]}>
                    <Text style={styles.readyOrNotText}>Game</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      startGame(props.roomNum);
                    }}
                    style={[
                      styles.readyOrNotCont,
                      {
                        backgroundColor: gameOn
                          ? 'green'
                          : oppoReady
                          ? 'red'
                          : 'gray',
                      },
                    ]}>
                    <Text style={styles.readyOrNotText}>Start game</Text>
                  </TouchableOpacity>
                )
              ) : null}
            </>
          </>
        ) : (
          <Text style={styles.bottomPlayerRowUserNameText}>
            במקום נול בנתיים
          </Text>
        )}
      </View>

      {youWin ? (
        <PopUp
          setShow={setYouWin}
          showTime={'set'}
          msgA={`YOU WON!`}
          msgB={endQuest}
          btnA={`YES`}
          onPressBtnA={reMatch}
          btnB={`Back to Lobby`}
          onPressBtnB={backToLobby}
        />
      ) : null}

      {youLose ? (
        <PopUp
          setShow={setYouLose}
          showTime={'set'}
          msgA={`YOU LOST!`}
          msgB={endQuest}
          btnA={`YES`}
          onPressBtnA={reMatch}
          btnB={`Back to Lobby`}
          onPressBtnB={backToLobby}
        />
      ) : null}

      {startGamePop ? (
        <PopUp setShow={setStartGamePop} showTime={3} msgA={`GAME START IN`} />
      ) : null}
    </View>
  );
};

export default Player;

const styles = StyleSheet.create({
  player: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'gray',
    margin: 0,
    padding: 0,
  },

  topRawEnemyDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '8%',
    backgroundColor: '#f45a5a',
    marginVertical: 20,
    padding: 0,
  },

  topRawEnemyDetailsText: {
    fontSize: 26,
    textAlign: 'center',
  },

  enemyPlayerVision: {
    borderWidth: 3,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    padding: 0,
    alignItems: 'center',
    width: '40%',
    height: '15%',
  },

  enemyPlayerVisionInText: {
    fontSize: 20,
    textAlign: 'center',
  },

  timeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '8%',
    backgroundColor: 'rgb(179, 96, 247)',
    marginVertical: 20,
    padding: 0,
  },

  timeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
    height: '100%',
  },

  timeText: {
    fontSize: 32,
    color: 'black',
    alignSelf: 'center',
    textAlign: 'center',
  },

  myPlayerVision: {
    borderWidth: 3,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    padding: 0,
    alignItems: 'center',
    width: '40%',
    height: '15%',
  },

  myPlayerVisionInText: {
    fontSize: 20,
    textAlign: 'center',
  },

  playerVisionImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  myPlayerVisionBtnToOpponent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  btnsContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginVertical: 20,
    padding: 0,
  },

  powerBtn: {
    margin: 0,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgb(13, 202, 240)',
    padding: 9,
    borderRadius: 15,
  },

  textInPowerBtn: {
    fontSize: 30,
  },

  bottomPlayerRow: {
    marginVertical: 20,
    padding: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '8%',
    backgroundColor: 'rgb(13, 202, 240)',
    flexDirection: 'row',
  },

  bottomPlayerRowUserNameText: {
    fontSize: 22,
  },
  bottomPlayerRowShotCounterText: {
    fontSize: 22,
  },

  readyOrNotCont: {
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 3,
    height: '80%',
    width: '14%',
    justifyContent: 'center',
    borderRadius: 15,
  },

  readyOrNotText: {
    textAlign: 'center',
    fontWeight: '800',
  },
});
