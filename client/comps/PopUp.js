import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const PopUp = (props) => {
  // console.log('PopUp PROPS', props);

  const socket = props.socket;
  const [showTime, setShowTime] = useState(props.showTime);
  const [msgAFontSize, setMsgAFontSize] = useState(
    props.msgAFontSize ? props.msgAFontSize : 36
  );
  const [msgBFontSize, setMsgBFontSize] = useState(
    props.msgBFontSize ? props.msgBFontSize : 22
  );
  const [msgCFontSize, setMsgCFontSize] = useState(
    props.msgCFontSize ? props.msgCFontSize : 16
  );

  useEffect(() => {
    let runTime;
    if (showTime > 0) {
      runTime = setInterval(() => {
        setShowTime(showTime - 1);
      }, 1000);
    } else if (showTime === 0) {
      props.setShow(false);
    }

    return () => {
      clearInterval(runTime);
    };
  }, [showTime]);

  return (
    <View style={styles.popUp}>
      <Text style={[styles.msgAstyle, { fontSize: msgAFontSize }]}>
        {props.msgA}
      </Text>

      {props.msgB ? (
        <Text style={[styles.msgBstyle, { fontSize: msgBFontSize }]}>
          {props.msgB}
        </Text>
      ) : null}
      {props.msgC ? (
        <Text style={[styles.msgCstyle, { fontSize: msgCFontSize }]}>
          {props.msgC}
        </Text>
      ) : null}

      {props.btnA ? (
        <TouchableOpacity
          style={styles.btnA}
          onPress={() => {
            props.onPressBtnA();
          }}>
          <Text style={styles.btnATextStyle}>{props.btnA}</Text>
        </TouchableOpacity>
      ) : null}

      {props.btnB ? (
        <TouchableOpacity
          style={styles.btnB}
          onPress={() => {
            props.onPressBtnB();
          }}>
          <Text style={styles.btnBTextStyle}>{props.btnB}</Text>
        </TouchableOpacity>
      ) : null}

      {showTime > 0 ? (
        <>
          <Text style={styles.showTime}>{showTime}</Text>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              props.setShow(false);
            }}>
            <Text style={styles.closeBtnText}>close</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

export default PopUp;

const styles = StyleSheet.create({
  popUp: {
    // flex: 1,
    position: 'absolute',
    alignSelf: 'center',
    // justifySelf: 'center',
    top: '30%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    // justifyContent: 'space-around',
    textAlign:'center',
    backgroundColor: 'green',
    width: '80%',
    height: '40%',
    // paddingBottom: 0,
    borderRadius:15,
  },

  msgAstyle: {
     marginVertical: 1,
    textAlign:'center',

  },

  msgBstyle: {
     marginVertical: 1,
    textAlign:'center',

  },

  msgCstyle: {
     marginVertical: 1,
    textAlign:'center',

  },

  btnA: {
    marginVertical: 3,
    padding: 3,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    textAlign:'center',

  },

  btnATextStyle: {
    fontSize:22,
    textAlign:'center',

  },

  btnB: {
     marginVertical: 3,
    padding: 3,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    textAlign:'center',

  },

  btnBTextStyle: {
    fontSize:22,
    textAlign:'center',

  },

  showTime: {
      marginVertical: 1,
    padding: 1,
    textAlign:'center',

  },

  closeBtn: {
      marginVertical: 1,
    padding: 1,
    textAlign:'center',

  },
  
});
