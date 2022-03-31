const express = require("express")
const http = require("http")
const ENV = require("dotenv")
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server)
ENV.config()

const home = io.of("/home")
const lobby = io.of("/lobby")
const room = io.of("/room")

global.rooms = {}
global.users = []

home.on("connection", (socket) => {
  socket.on("welcomeToServer", (data) => {
    let msg = "home - welcome to gunns server"

    console.log("home connection - server", msg, socket.id)
    console.log("home connection - rooms", rooms)
    console.log("SOCKET ROOMS: ", socket.nsp.adapter.rooms)

    socket.emit("welcome", msg)
  })
})

lobby.on("connection", (socket) => {
  socket.on("welcomeToLobby", (data) => {
    let msg = "Lobby - Create or join room"

    console.log("lobby connection - server", msg, socket.id)

    socket.emit("inLobby", msg)
  })

  socket.on("isRoomExsist", (num) => {
    if (rooms[num]) {
      console.log("ROOM EXSIST ALLREADY")
      socket.emit("answerIfRoomExist", true)
    } else {
      console.log("ROOM NOT-EXSIST. you CAN CREATE")
      socket.emit("answerIfRoomExist", false)
    }
  })
})

room.on("connection", (socket) => {
  socket.on("joinRoom", (userName, roomId) => {
    console.log("joinRoom => userName, roomId", userName, roomId)
    console.log(105, socket.id)

    socket.join(roomId)

    let newUser = {
      userName,
      id: socket.id,
    }

    if (rooms[roomId]) {
      // join room
      const isUserExist = rooms[roomId].findIndex((x) => x.id === socket.id)

      if (isUserExist !== -1) {
        //if he allready in the room

        if (rooms[roomId][isUserExist].admin) {
          //if hes the admin

          newUser = {
            // asign him new details with admin
            ...newUser,
            admin: true,
          }
          rooms[roomId][isUserExist] = newUser
        } else {
          //if he isnt the admin
          newUser = {
            // asign him new details with opponent
            ...newUser,
            opponent: false,
          }
          rooms[roomId][isUserExist] = newUser
        }
      } else {
        //if he wasnt in room - add him to the room

        newUser = {
          // asign him new details with opponent
          ...newUser,
          opponent: false,
        }

        rooms[roomId].push(newUser)
      }
    } else {
      // create room
      newUser = {
        ...newUser,
        admin: true,
      }

      rooms[roomId] = [newUser]
    }

    const rest = rooms[roomId].filter((x) => x.userName !== userName)
    socket.emit("meEnteredRoom", rest, newUser)
    socket.in(roomId).emit("someoneEnteredAndNewRoom", rest, newUser)
  })

  socket.on("setUpOpponentForServer", (roomId) => {
    const setOp = rooms[roomId].findIndex((pl) => pl.id === socket.id)
    rooms[roomId][setOp].opponent = true

    socket.in(roomId).emit("setUpOpponentOnFront", rooms[roomId][setOp])
    socket.emit("setUpOpponentOnFront", rooms[roomId][setOp])
  })

  socket.on("imReady", (admin) => {
    socket.to(admin.id).emit("opponentIsReady")
    socket.emit("opponentIsReady")
  })

  socket.on("startGame", (roomId) => {
    socket.emit("setTimeToThree")
    socket.in(roomId).emit("setTimeToThree")
  })

  socket.on(
    "sendMyActionToServer",
    (player, roomId, action, admin, opponent) => {
      if (player.admin === true) {
        socket.to(opponent.id).emit("rivalAction", action)
      }

      if (player.opponent === true) {
        socket.to(admin.id).emit("rivalAction", action)
      }
    }
  )

  socket.on("adminWin", (roomId) => {
    socket.emit("adminWinFromServer")
  })

  socket.on("adminLose", (roomId) => {
    socket.emit("adminLoseFromServer")
  })

  socket.on("rematch", (player, roomId, admin, opponent) => {
    console.log("rematch-rematch-rematch: ", player, roomId, admin, opponent)

    if (player.admin === true) {
      socket
        .to(opponent.id)
        .emit("wantRematch", player, roomId, admin, opponent)
      console.log("adminWantRematch to opponent")
    }

    if (player.opponent === true) {
      socket.to(admin.id).emit("wantRematch", player, roomId, admin, opponent)
      console.log("opponentWantRematch to admin")
    }
  })

  socket.on("startNewRoundWithSamePlayers", (roomId) => {
    socket.emit("startNewRoundWithSamePlayersFromServer")
    socket.in(roomId).emit("startNewRoundWithSamePlayersFromServer")

    console.log("startNewRoundWithSamePlayers")
  })

  socket.on("wentToLobby", (player, roomId, admin, opponent) => {
    if (player) {
      if (player.admin === true) {
        socket
          .to(opponent.id)
          .emit("wentToLobbyFromServer", player, admin, opponent)
        console.log("only 1 241")
      }

      if (player.opponent === true) {
        socket
          .to(admin.id)
          .emit("wentToLobbyFromServer", player, admin, opponent)
        console.log("only 1 247")
      }
    }

    if (rooms[roomId]) {
      const goOutFromRoomInRooms = rooms[roomId].findIndex(
        (x) => x.id === socket.id
      )
      console.log(254, goOutFromRoomInRooms)
      rooms[roomId].splice(goOutFromRoomInRooms, 1)

      if (rooms[roomId].length === 0) {
        delete rooms[roomId]
      }
    }
    socket.leave(roomId)

    // console.log("SOCKET ROOMS 3: ", socket.nsp.adapter.rooms)
  })
})

const PORT = process.env.PORT || 3011
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})
