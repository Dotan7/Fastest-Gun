import React, { useState, useEffect, useRef } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom"
import Invitation from "../comps/Invitation"
import { BsBackspaceFill } from "react-icons/bs"
import { AiOutlineHeart } from "react-icons/ai"
import { GiBullets } from "react-icons/gi"
import SettingsOption from "../comps/SettingsOption"
import aim from "../assets/aim.png"
import bullet from "../assets/bullet.png"
import shield from "../assets/shield.png"
import io from "socket.io-client"
import url from "../url"

const socket = io.connect(url + "/")

function PcGame(props) {
  const navigate = useNavigate()
  const [me, setMe] = useState()
  const firstEnter = useRef(true)
  const fidbackTextShown = useRef()
  //settings
  const [settings, setSettings] = useState({
    gameTime: 3,
    gameLives: 2,
  })

  // flow consts
  const [meReadyToPlay, setMeReadyToPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // game consts
  const myAction = useRef(null)
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
        where: "In Pc Game!",
        action: null,
      })

      socket.on("invitation", (userInviteYou) => {
        props.setOpponent(userInviteYou)
        props.setIsBeingInvited(true)
      })

      socket.on("openingTestFromServer", (time) => {
        setGameOver(false)
        setIsPlaying(true)
        setTime(null)
        shots.current = 0

        if (fidbackTextShown.current) {
          fidbackTextShown.current.innerText = ""
          fidbackTextShown.current.style.backgroundColor = "rgb(109, 27, 16,0)"
        }
        setOpeningTime(time)
      })

      socket.on("roundInTestFromServer", (time) => {
        setTime(time)
      })

      socket.on("checkRound", (pcAction) => {
        let myActionLocal = myAction.current
        let opAction = pcAction
        myAction.current = null
        if (opView.current) {
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
          myView.current.style.backgroundColor = "#2197ff"
          myView.current.style.backgroundImage =
            myActionLocal === "shot"
              ? `url(${aim})`
              : myActionLocal === "shield"
              ? `url(${shield})`
              : myActionLocal === "load"
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

        if (myActionLocal === null || myActionLocal === undefined) {
          if (opAction === "shot") {
            // i loose
            strikesFunction("false")
          }
        }

        if (myActionLocal === "shot") {
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

        if (myActionLocal === "load") {
          shots.current = shots.current + 1

          if (opAction === "shot") {
            // i loose
            strikesFunction("false")
          }
        }

        if (myActionLocal === "shield") {
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
        fidbackTextShown.current.innerText = `מחשב הגן על עצמו!! =(`
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
    socket.emit("endTest")
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
    setMeReadyToPlay(true)
    lives.current = settings.gameLives
    opLives.current = settings.gameLives
    socket.emit("openingTest", settings.gameTime)
  }

  const actionFunction = (myActionInFunc) => {
    if (myActionInFunc === "shot") {
      if (shots.current > 0) {
        myAction.current = myActionInFunc
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
      myAction.current = myActionInFunc
    }
  }

  const reMatchOffer = () => {
    setGameOver(false)
    setIsPlaying(true)
    setMeReadyFunc()
  }

  const leaveGameToGameLobby = (leftHow) => {
    socket.emit("endTest")
    navigate("/home")
  }

  const acceptOrDeclineGame = (yesOrNo) => {
    if (yesOrNo === "yes") {
      props.setIsBeingInvited(false)
      socket.emit("acceptGameOffer", me, props.opponent, (answer) => {
        props.setRoomNum(answer)
        navigate(`/battle/${props.opponent.userName}-vs-${props.userName}`)
      })
    } else if (yesOrNo === "no") {
      props.setIsBeingInvited(false)
      socket.emit("diclineGameOffer", me, props.opponent)
      props.setOpponent(null)
    }
  }

  return (
    <div className="battlePageDiv">
      {props.isBeingInvited ? (
        <Invitation
          opponent={props.opponent}
          acceptOrDeclineGame={acceptOrDeclineGame}
          userName={props.userName}
        />
      ) : null}

      {!meReadyToPlay || gameOver ? (
        <div className="optionsInGameOver">
          <div
            className="topLineInOptiosGameOver"
            style={{
              borderBottomLeftRadius: gameOver ? "0px" : "25px",
              borderBottomRightRadius: gameOver ? "0px" : "25px",
            }}
          >
            <SettingsOption settings={settings} setSettings={setSettings} />
          </div>
          <div
            className="bottomLineInOptiosGameOver"
            style={{
              display: gameOver ? "flex" : "none",
            }}
          >
            <button
              className="reMatchBtn"
              onClick={() => {
                reMatchOffer()
              }}
            >
              משחק חוזר?
            </button>
            <button
              className="goToGamesLobyBtn"
              onClick={() => {
                leaveGameToGameLobby("GoBack")
              }}
            >
              חזור למשחקים
            </button>
          </div>
        </div>
      ) : null}

      <div className="opponentInfoLine">
        <div className="innerInfoDiv livesDiv">
          {opLives.current} X
          <AiOutlineHeart className="heartIcon" />
        </div>
        <div className="innerInfoDiv opponentName">מחשב</div>
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
        {!isPlaying ? null : (
          <div className="viewWindow opponentViewWindow" ref={opView}>
            {time !== 0 ? "מחשב" : null}
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
            onClick={() => {
              setMeReadyFunc()
            }}
          >
            התחל משחק
          </button>
        ) : gameOver && !isPlaying ? null : (
          <div
            className="viewWindow myViewWindow"
            ref={myView}
            style={{
              backgroundImage:
                time > 0
                  ? myAction.current === "shot"
                    ? `url(${aim})`
                    : myAction.current === "shield"
                    ? `url(${shield})`
                    : myAction.current === "load"
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
            backgroundColor:
              myAction.current === "load" ? "#2197ff59" : "#2197ff",
            border: myAction.current === "load" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            actionFunction("load")
          }}
        >
          טעינה
        </button>
        <button
          className="battleBtnShot gameBtnBig"
          style={{
            backgroundColor:
              myAction.current === "shot" ? "#2197ff59" : "#2197ff",
            border: myAction.current === "shot" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            actionFunction("shot")
          }}
        >
          ירייה
        </button>
        <button
          className="battleBtnShield gameBtnBig"
          style={{
            backgroundColor:
              myAction.current === "shield" ? "#2197ff59" : "#2197ff",
            border: myAction.current === "shield" ? "solid 1px white" : "none",
          }}
          onClick={() => {
            actionFunction("shield")
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

export default PcGame
