import React, { useState, useEffect, useRef } from "react"
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from "react-router-dom"

import io from "socket.io-client"
import url from "../url"
import { BsBackspaceFill } from "react-icons/bs"
import { AiOutlineHeart } from "react-icons/ai"
import { GiBullets } from "react-icons/gi"
import SettingsOption from "../comps/SettingsOption"
import aim from "../assets/aim.png"
import bullet from "../assets/bullet.png"
import shield from "../assets/shield.png"

const socket = io.connect(url + "/")

function BattlePage(props) {
  const navigate = useNavigate()
  const [me, setMe] = useState()
  const [opponent, setOpponent] = useState(props.opponent)
  const firstEnter = useRef(true)
  const fidbackTextShown = useRef()

  // flow consts
  const [meReadyToPlay, setMeReadyToPlay] = useState(false)
  const [opponentReadyToPlay, setOpponentReadyToPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [rematchOfferToYou, setRematchOfferToYou] = useState(false)
  const [iOfferedRemach, setIOfferedRemach] = useState(true)
  const [isWaitingForRematch, setIsWaitingForRematch] = useState(false)
  const [isRematch, setIsRematch] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)

  // game consts
  const [myAction, setMyAction] = useState(null)
  const myView = useRef()
  const opView = useRef()
  const shots = useRef(0)
  const lives = useRef(0)
  const opLives = useRef(0)
  const [time, setTime] = useState(null)
  const [openingTime, setOpeningTime] = useState(null)

  useEffect(() => {
    if (firstEnter.current) {
      setMe({ userName: props.userName, id: socket.id })
      firstEnter.current = false
      socket.emit("updateMe", {
        userName: props.userName,
        id: socket.id,
        where: "In Battle!",
        action: null,
      })

      socket.emit(
        "joinMeToRoom",
        { userName: props.userName, id: socket.id },
        props.roomNum
      )
      socket.on("openingGameFromServer", (time, gameLives) => {
        setGameOver(false)
        setRematchOfferToYou(false)
        setIOfferedRemach(true)
        setIsWaitingForRematch(false)
        setIsRematch(false)
        setOpponentLeft(false)
        setIsPlaying(true)
        setTime(null)
        shots.current = 0
        lives.current = gameLives
        opLives.current = gameLives
        if (fidbackTextShown.current) {
          fidbackTextShown.current.innerText = ""
          fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16,0)"
        }
        setOpeningTime(time)
      })
      socket.on("roundInGameFromServer", (time) => {
        setTime(time)
      })

      socket.on("opponentIsReadyToPlay", (opponent, readyOrNot) => {
        setOpponentReadyToPlay(readyOrNot)
        setOpponent(opponent)
        if (meReadyToPlay) {
          socket.emit("openingGame", props.roomNum)
        }
      })

      socket.on("rematchOfferToYou", () => {
        setRematchOfferToYou(true)
        setIOfferedRemach(false)
      })

      socket.on("oppenentLeftTheGame", () => {
        if (fidbackTextShown.current) {
          fidbackTextShown.current.innerText = `${props.opponent.userName} עזב את המשחק `
          fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16)"
        }
        socket.emit("leaveRoom", props.roomNum)

        const timeTemp = setTimeout(() => {
          if (fidbackTextShown.current) {
            fidbackTextShown.current.innerText = ""
            fidbackTextShown.current.style.backgroundColor =
              "rgb(109, 27, 16,0)"
          }
          props.setOpponent(null)
          props.setRoomNum(null)

          navigate("/setbattle")
          clearTimeout(timeTemp)
        }, 2000)
      })

      socket.on("checkRound", (data) => {
        setMyAction(null)
        let myAction
        let opAction

        if (props.userName === data.nameOne) {
          myAction = data.actionOne
          opAction = data.actionTwo
        } else {
          myAction = data.actionTwo
          opAction = data.actionOne
        }
        if (opView.current) {
          // opView.current.innerText = opAction;
          opView.current.style.backgroundColor = "#2197ff"
          opView.current.style.backgroundImage =
            opAction === "shot"
              ? `url(${aim})`
              : opAction === "shield"
              ? `url(${shield})`
              : opAction === "load"
              ? `url(${bullet})`
              : null

          const timeTemp = setTimeout(() => {
            if (opView.current) {
              opView.current.innerText = ""
              opView.current.style.backgroundColor = "rgb(109, 27, 16,0)"
              opView.current.style.backgroundImage = `none`
            }
            clearTimeout(timeTemp)
          }, 1000)
        }

        if (myView.current) {
          // myView.current.innerText = myAction;
          myView.current.style.backgroundColor = "#2197ff"
          myView.current.style.backgroundImage =
            myAction === "shot"
              ? `url(${aim})`
              : myAction === "shield"
              ? `url(${shield})`
              : myAction === "load"
              ? `url(${bullet})`
              : null

          const timeTemp = setTimeout(() => {
            if (myView.current) {
              myView.current.innerText = ""
              myView.current.style.backgroundColor = "rgb(109, 27, 16,0)"
              myView.current.style.backgroundImage = "none"
            }
            clearTimeout(timeTemp)
          }, 1000)
        }

        if (myAction === null || myAction === undefined) {
          if (opAction === "shot") {
            // i loose
            strikesFunction("false")
          }
        }

        if (myAction === "shot") {
          shots.current = shots.current - 1

          if (
            opAction === null ||
            opAction === undefined ||
            opAction === "load"
          ) {
            // i win
            strikesFunction("true")
          }

          if (opAction === "shield") {
            // i miss
            strikesFunction("miss")
          }
        }

        if (myAction === "load") {
          shots.current = shots.current + 1

          if (opAction === "shot") {
            // i loose
            strikesFunction("false")
          }
        }

        if (myAction === "shield") {
          if (opAction === "shot") {
            // i def
            strikesFunction("def")
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!props.userName) {
      socket.emit("leaveRoom", props.roomNum)
      props.setRoomNum(null)
      navigate("/")
    }
  }, [props.userName])

  onpopstate = (e) => {
    leaveGameToGameLobby()
  }

  const strikesFunction = (winOrLoose) => {
    if (winOrLoose === "true") {
      opLives.current = opLives.current - 1
    } else if (winOrLoose === "false") {
      lives.current = lives.current - 1
    }

    if (lives.current === 0) {
      return gameOverFunction(false)
    }
    if (opLives.current === 0) {
      return gameOverFunction(true)
    }
    if (fidbackTextShown.current) {
      if (winOrLoose === "true") {
        fidbackTextShown.current.innerText = `פגיעה טובה!! =)`
        fidbackTextShown.current.style.backgroundColor = "rgb(19, 122, 91)"
      } else if (winOrLoose === "miss") {
        fidbackTextShown.current.innerText = `${props.opponent.userName} הגן על עצמו!! =(`
        fidbackTextShown.current.style.backgroundColor = "#2197ff59"
      } else if (winOrLoose === "def") {
        fidbackTextShown.current.innerText = `הגנת על עצמך!! =)`
        fidbackTextShown.current.style.backgroundColor = "#2197ff"
      } else if (winOrLoose === "false") {
        fidbackTextShown.current.innerText = `נפגעת!! =(`
        fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16)"
      }

      const timeTemp = setTimeout(() => {
        fidbackTextShown.current.innerText = ""
        fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16,0)"
        clearTimeout(timeTemp)
      }, 1000)
    }
  }
  const gameOverFunction = (winOrLoose) => {
    socket.emit("gameOver", props.roomNum)
    setIsPlaying(false)
    setGameOver(true)
    if (fidbackTextShown.current) {
      if (winOrLoose) {
        fidbackTextShown.current.innerText = `המשחק נגמר - ניצחת!! =)`
        fidbackTextShown.current.style.backgroundColor = "rgb(19, 122, 91)"
      } else {
        fidbackTextShown.current.innerText = `המשחק נגמר - הפסדת!! =(`
        fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16)"
      }
    }
  }

  const setMeReadyFunc = () => {
    setMeReadyToPlay(!meReadyToPlay)
    socket.emit("meReadyToPlay", me, opponent, !meReadyToPlay, props.roomNum)

    if (opponentReadyToPlay && !meReadyToPlay) {
      socket.emit("openingGame", props.roomNum)
    }
  }

  const setMyActionFunction = (myAction) => {
    if (myAction === "shot") {
      if (shots.current > 0) {
        setMyAction(myAction)
        socket.emit("myAction", props.roomNum, myAction)
      } else {
        if (fidbackTextShown.current) {
          fidbackTextShown.current.innerText = `אין לך יריות!! =)`
          fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16)"
          const timeTemp = setTimeout(() => {
            if (fidbackTextShown.current) {
              fidbackTextShown.current.innerText = ""
              fidbackTextShown.current.style.backgroundColor =
                "rgb(109, 27, 16,0)"
            }
            clearTimeout(timeTemp)
          }, 500)
        }
      }
    } else {
      setMyAction(myAction)
      socket.emit("myAction", props.roomNum, myAction)
    }
  }

  const reMatchOffer = () => {
    if (iOfferedRemach) {
      socket.emit(
        "gameSettings",
        props.roomNum,
        props.settings.gameTime,
        props.settings.gameLives
      )

      socket.emit("rematchOffer", props.roomNum, props.opponent, (answer) => {
        if (answer) {
          setIsWaitingForRematch(true)
        } else {
          setOpponentLeft(true)
          navigate("/setbattle")
        }
      })
    } else if (rematchOfferToYou) {
      socket.emit("openingGame", props.roomNum)
      setGameOver(false)
      setIsPlaying(true)
    }
  }

  const leaveGameToGameLobby = (leftHow) => {
    socket.emit("leaveRoom", props.roomNum)
    props.setRoomNum(null)
    navigate("/setbattle")
  }

  return (
    <div className="battlePageDiv">
      {!isPlaying && gameOver ? (
        <div className="optionsInGameOver">
          <div className="topLineInOptiosGameOver">
            <SettingsOption
              settings={props.settings}
              setSettings={props.setSettings}
            />
          </div>
          <div className="bottomLineInOptiosGameOver">
            <button
              className="reMatchBtn"
              onClick={() => {
                reMatchOffer()
              }}
            >
              {rematchOfferToYou
                ? `${props.opponent.userName} מזמין משחק חוזר `
                : opponentLeft
                ? `${props.opponent.userName} יצא מהמשחק`
                : isRematch
                ? `${props.opponent.userName} אישר את בקשתך - קדימה מתחילים`
                : isWaitingForRematch
                ? `ממתין לתשובה מ ${props.opponent.userName}`
                : "משחק חוזר?"}
            </button>
            <button
              className="goToGamesLobyBtn"
              onClick={() => {
                leaveGameToGameLobby(
                  rematchOfferToYou ? "rejectAndGoBack" : "GoBack"
                )
              }}
            >
              {rematchOfferToYou ? "דחה וחזור למשחקים" : "חזור למשחקים"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="opponentInfoLine">
        <div className="innerInfoDiv livesDiv">
          {opLives.current} X
          <AiOutlineHeart className="heartIcon" />
        </div>
        <div className="innerInfoDiv opponentName">
          {props.opponent.userName ? props.opponent.userName : null}
        </div>
        <div className="innerInfoDiv">
          <BsBackspaceFill
            className="backToGames"
            size={30}
            onClick={() => {
              leaveGameToGameLobby("GoBack")
            }}
          />
        </div>
      </div>

      <div className="opponentAreaLine">
        {!gameOver && !isPlaying ? (
          <button
            className="gameBtnMed lookLikeBtn"
            style={{
              backgroundColor: opponentReadyToPlay
                ? "rgb(19, 122, 91)"
                : "rgb(109, 27, 16)",
            }}
          >
            {opponentReadyToPlay
              ? ` ${opponent.userName} מוכן לשחק`
              : ` ${opponent.userName} לא מוכן לשחק`}
          </button>
        ) : gameOver && !isPlaying ? null : (
          <div className="viewWindow opponentViewWindow" ref={opView}>
            {time !== 0 ? opponent.userName : null}
          </div>
        )}
      </div>

      <div className="fidbackTextShownDiv"></div>
      <div className="TimeZoneLine">
        {gameOver
          ? null
          : !gameOver && !isPlaying
          ? null
          : !gameOver && isPlaying && time
          ? time
          : openingTime !== 0
          ? `מתחילים בעוד ${openingTime}`
          : openingTime === 0 && time === null
          ? `קדימה`
          : "בוחן"}
      </div>

      <div className="fidbackTextShownDiv">
        <div className="fidbackTextShown" ref={fidbackTextShown}></div>
      </div>
      <div className="myAreaLine">
        {!gameOver && !isPlaying ? (
          <button
            className="gameBtnMed"
            style={{
              backgroundColor: meReadyToPlay
                ? "rgb(19, 122, 91)"
                : "rgb(109, 27, 16)",
            }}
            onClick={() => {
              setMeReadyFunc()
            }}
          >
            {meReadyToPlay ? "אני מוכן לשחק" : "אני לא מוכן לשחק"}
          </button>
        ) : gameOver && !isPlaying ? null : (
          <div
            className="viewWindow myViewWindow"
            ref={myView}
            style={{
              backgroundImage:
                time > 0
                  ? myAction === "shot"
                    ? `url(${aim})`
                    : myAction === "shield"
                    ? `url(${shield})`
                    : myAction === "load"
                    ? `url(${bullet})`
                    : null
                  : null,
            }}
          ></div>
        )}
      </div>

      <div
        className="myControlLine"
        style={{ display: isPlaying ? "flex" : "flex" }}
      >
        <button
          className="battleBtnLoad gameBtnBig"
          style={{
            backgroundColor: myAction === "load" ? "#2197ff59" : "#2197ff",
            border: myAction === "load" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            setMyActionFunction("load")
          }}
        >
          טעינה
        </button>
        <button
          className="battleBtnShot gameBtnBig"
          style={{
            backgroundColor: myAction === "shot" ? "#2197ff59" : "#2197ff",
            border: myAction === "shot" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            setMyActionFunction("shot")
          }}
        >
          ירייה
        </button>
        <button
          className="battleBtnShield gameBtnBig"
          style={{
            backgroundColor: myAction === "shield" ? "#2197ff59" : "#2197ff",
            border: myAction === "shield" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            setMyActionFunction("shield")
          }}
        >
          הגנה
        </button>
      </div>

      <div className="myInfoLine">
        <div className="innerInfoDiv livesDiv">
          {lives.current} X
          <AiOutlineHeart className="heartIcon" />
        </div>

        <div className="innerInfoDiv myNameDiv">{props.userName}</div>
        <div className="innerInfoDiv questionsToEndDiv">
          {shots.current} X
          <GiBullets className="heartIcon" />
        </div>
      </div>
    </div>
  )
}

export default BattlePage
