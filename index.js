const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server, {
  cors: {
    origin: "https://fastestgun.herokuapp.com",
    methods: ["GET", "POST"],
  },
})
const cors = require("cors")
const path = require("path")

app.use(cors())

const admin = io.of("/admin")
const game = io.of("/")

global.settings = {}
global.rooms = {}
global.users = []

game.on("connection", (socket) => {
  const openingTime = (time, roomNum) => {
    if (time > 0) {
      const oneSecond = setInterval(() => {
        time--
        socket
          .in(roomNum)
          .emit("openingGameFromServer", time, settings[roomNum].gameLives)
        socket.emit("openingGameFromServer", time, settings[roomNum].gameLives)
        openingTime(time, roomNum)
        clearInterval(oneSecond)
      }, 1000)
    } else {
      roundTime(Number(settings[roomNum].gameTime) + 1, roomNum)
    }
  }

  const roundTime = (time, roomNum) => {
    if (settings[roomNum].gamingNow) {
      if (time > 0) {
        const oneSecond = setInterval(() => {
          time--
          socket.in(roomNum).emit("roundInGameFromServer", time)
          socket.emit("roundInGameFromServer", time)
          roundTime(time, roomNum)
          clearInterval(oneSecond)
        }, 1000)
      } else {
        if (rooms[roomNum]) {
          socket.in(roomNum).emit("checkRound", {
            nameOne: rooms[roomNum][0].userName,
            actionOne: rooms[roomNum][0].action,
            nameTwo: rooms[roomNum][1].userName,
            actionTwo: rooms[roomNum][1].action,
          })
          socket.emit("checkRound", {
            nameOne: rooms[roomNum][0].userName,
            actionOne: rooms[roomNum][0].action,
            nameTwo: rooms[roomNum][1].userName,
            actionTwo: rooms[roomNum][1].action,
          })
          rooms[roomNum][0].action = null
          rooms[roomNum][1].action = null
          roundTime(Number(settings[roomNum].gameTime) + 1, roomNum)
        }
      }
    }
  }

  const openingTimeForTest = (time, timeForRoundInTest) => {
    const userToStartTest = users.filter((x) => x.id === socket.id)
    const findUserToStartTest = users.indexOf(userToStartTest[0])
    if (findUserToStartTest !== -1) {
      if (users[findUserToStartTest].action === "battelPc") {
        if (time > 0) {
          const oneSecond = setInterval(() => {
            time--
            socket.emit("openingTestFromServer", time)
            openingTimeForTest(time, timeForRoundInTest)
            clearInterval(oneSecond)
          }, 1000)
        } else {
          roundTimeForTest(
            Number(timeForRoundInTest) + 1,
            Number(timeForRoundInTest) + 1
          )
        }
      }
    }
  }

  const roundTimeForTest = (time, timeForRoundInTest) => {
    const userToStartTest = users.filter((x) => x.id === socket.id)
    const findUserToStartTest = users.indexOf(userToStartTest[0])
    if (findUserToStartTest !== -1) {
      if (users[findUserToStartTest].action === "battelPc") {
        if (time > 0) {
          const oneSecond = setInterval(() => {
            time--
            socket.emit("roundInTestFromServer", time)
            roundTimeForTest(time, timeForRoundInTest)
            clearInterval(oneSecond)
          }, 1000)
        } else {
          let pcAction
          if (
            users[findUserToStartTest].pcCtr === undefined ||
            users[findUserToStartTest].pcCtr === null ||
            users[findUserToStartTest].pcCtr === 0
          ) {
            users[findUserToStartTest].pcCtr = 0
            pcAction = Math.floor(Math.random() * 2) + 1
          } else if (users[findUserToStartTest].pcCtr > 0) {
            pcAction = Math.floor(Math.random() * 3) + 1
          }

          if (pcAction === 1) {
            pcAction = "shield"
          } else if (pcAction === 2) {
            pcAction = "load"
            users[findUserToStartTest].pcCtr =
              users[findUserToStartTest].pcCtr + 1
          } else if (pcAction === 3) {
            pcAction = "shot"
            users[findUserToStartTest].pcCtr =
              users[findUserToStartTest].pcCtr - 1
          }

          socket.emit("checkRound", pcAction)

          roundTimeForTest(
            Number(timeForRoundInTest),
            Number(timeForRoundInTest)
          )
        }
      }
    }
  }
  socket.on("checkIfNameValid", (userNameInput, answer) => {
    const isNameExsist = users.filter((x) => x.userName === userNameInput)
    if (isNameExsist.length === 0) {
      answer(false)
    } else {
      answer(true)
    }
  })

  socket.on("pushToNamesArrInServer", (userNameInput) => {
    users.push({
      userName: userNameInput,
      id: socket.id,
      where: "Welcome",
      action: null,
    })
  })

  socket.on("updateMe", (userObj) => {
    const userToUpdate = users.filter((x) => x.userName === userObj.userName)
    const findUserToUpdate = users.indexOf(userToUpdate[0])
    if (findUserToUpdate === -1) {
    } else {
      users[findUserToUpdate].id = userObj.id
      users[findUserToUpdate].where = userObj.where
      users[findUserToUpdate].action = userObj.action
    }
  })

  socket.on("tryToConnectFromFront", (playerToCall, me, answer) => {
    const isNameExsist = users.filter((x) => x.userName === playerToCall)

    if (isNameExsist.length === 0) {
      answer("notExistOrNotOnline")
    } else {
      if (isNameExsist[0].roomNum) {
        answer("inGameNow")
      } else {
        answer("waitingForAnswerFromUser")
        socket.to(isNameExsist[0].id).emit("invitation", me)
      }
    }
  })

  socket.on("diclineGameOffer", (plyaerDecline, opponentOfferDecline) => {
    socket
      .to(opponentOfferDecline.id)
      .emit("yourOfferHasBeenDeclined", plyaerDecline.id)
  })

  socket.on(
    "acceptGameOffer",
    (plyaerAccepted, opponentOfferAccepted, answer) => {
      let roomNum = Math.floor(Math.random() * 5000) + 1
      answer(roomNum)
      socket
        .to(opponentOfferAccepted.id)
        .emit("yourOfferHasBeenAccepted", plyaerAccepted, roomNum)
    }
  )

  socket.on("joinMeToRoom", (me, roomNum) => {
    socket.join(roomNum)
    const userToUpdate = users.filter((x) => x.userName === me.userName)
    const findUserToUpdate = users.indexOf(userToUpdate[0])
    users[findUserToUpdate].roomNum = roomNum
    if (rooms[roomNum]) {
      rooms[roomNum].push(me)
    } else {
      rooms[roomNum] = [me]
    }
  })

  socket.on("gameSettings", (roomNum, gameTime, gameLives) => {
    settings[roomNum] = {
      gameTime,
      gameLives,
    }
  })

  socket.on("meReadyToPlay", (me, opponent, readyOrNot, roomNum) => {
    socket.in(roomNum).emit("opponentIsReadyToPlay", me, readyOrNot)
  })
  socket.on("openingGame", async (roomNum) => {
    if (
      settings[roomNum].gamingNow === undefined ||
      settings[roomNum].gamingNow === false
    ) {
      settings[roomNum].gamingNow = true
      openingTime(4, roomNum)
    }
  })

  socket.on("openingTest", (timeInRoundInTest) => {
    const userToStartTest = users.filter((x) => x.id === socket.id)
    const findUserToStartTest = users.indexOf(userToStartTest[0])
    users[findUserToStartTest].action = "battelPc"
    openingTimeForTest(4, timeInRoundInTest)
  })

  socket.on("endTest", () => {
    const userToStartTest = users.filter((x) => x.id === socket.id)
    const findUserToStartTest = users.indexOf(userToStartTest[0])
    if (findUserToStartTest !== -1) {
      users[findUserToStartTest].action = null
      users[findUserToStartTest].pcCtr = 0
    }
  })

  socket.on("myAction", (roomNum, myAction) => {
    if (rooms[roomNum]) {
      const findUserToUpdateAction = rooms[roomNum].filter(
        (x) => x.id === socket.id
      )
      if (findUserToUpdateAction.length === 1) {
        if (findUserToUpdateAction[0].action === undefined) {
          findUserToUpdateAction[0].action = myAction
        } else {
          findUserToUpdateAction[0].action = myAction
        }
      }
    }
  })
  socket.on("gameOver", (roomNum) => {
    settings[roomNum].gamingNow = false

    if (rooms[roomNum]) {
      if (rooms[roomNum][0] !== undefined) {
        rooms[roomNum][0].action = null
      }
      if (rooms[roomNum][1] !== undefined) {
        rooms[roomNum][1].action = null
      }
    }
  })
  socket.on("rematchOffer", (roomNum, opponent, answer) => {
    const stilHere = rooms[roomNum].filter(
      (x) => x.userName === opponent.userName
    )
    const isHe = stilHere[0]

    if (stilHere.length === 0) {
      answer(false)
    } else {
      answer(true)
      socket.in(roomNum).emit("rematchOfferToYou")
    }
  })

  socket.on("leaveRoom", (roomNum) => {
    socket.leave(roomNum)
    const userToUpdate = users.filter((x) => x.id === socket.id)
    const findUserToUpdate = users.indexOf(userToUpdate[0])
    if (users[findUserToUpdate]) {
      users[findUserToUpdate].roomNum = null
      users[findUserToUpdate].action = null
      users[findUserToUpdate].pcCtr = 0
    }
    if (rooms[roomNum]) {
      settings[roomNum].gamingNow = false
      const leavingUser = rooms[roomNum].findIndex((x) => x.id === socket.id)
      rooms[roomNum].splice(leavingUser, 1)

      if (rooms[roomNum].length === 0) {
        delete rooms[roomNum]
      } else {
        socket.in(roomNum).emit("oppenentLeftTheGame")
      }
    }
  })

  socket.on("disconnect", (e) => {
    socket.leave()

    for (const key in rooms) {
      rooms[key].map((player, playerInd) => {
        if (player.id === socket.id) {
          rooms[key].splice(playerInd, 1)
          settings[Number(key)].gamingNow = false
          if (rooms[key].length === 0) {
            delete rooms[key]
          } else {
            socket.in(Number(key)).emit("oppenentLeftTheGame")

            const timeTemp = setTimeout(() => {
              delete rooms[key]
              clearTimeout(timeTemp)
            }, 4000)
          }
        }
      })
    }
    users.map((player, playerInd) => {
      if (player.id === socket.id) {
        users.splice(playerInd, 1)
      }
    })
  })
})

admin.on("connection", (socket) => {
  socket.on("someoneInAdminPage", (answer) => {
    answer({ users, rooms })
  })

  socket.on("verifyAdminPassword", (pass, answer) => {
    if (pass === "zoharAdmin2022") {
      answer(true)
    } else {
      answer(false)
    }
  })
})

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "./client/build")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
  })
}

const PORT = process.env.PORT || 3016
// listen to server
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
