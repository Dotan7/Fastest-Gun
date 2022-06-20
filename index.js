const { table } = require("console");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://fastestgun.herokuapp.com",
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");
const path = require("path");

app.use(cors());
// paths
const admin = io.of("/admin");
const game = io.of("/");

global.settings = {};
global.rooms = {};
global.users = [];

game.on("connection", (socket) => {
  const openingTime = (time, roomNum) => {
    if (time > 0) {
      const oneSecond = setInterval(() => {
        console.log(time);
        time--;
        socket
          .in(roomNum)
          .emit("openingGameFromServer", time, settings[roomNum].gameLives);
        socket.emit("openingGameFromServer", time, settings[roomNum].gameLives);
        openingTime(time, roomNum);
        clearInterval(oneSecond);
      }, 1000);
    } else {
      console.log("opening time over");
      roundTime(Number(settings[roomNum].gameTime) + 1, roomNum);
    }
  };

  const roundTime = (time, roomNum) => {
    if (settings[roomNum].gamingNow) {
      if (time > 0) {
        const oneSecond = setInterval(() => {
          console.log(time);
          time--;
          socket.in(roomNum).emit("roundInGameFromServer", time);
          socket.emit("roundInGameFromServer", time);
          roundTime(time, roomNum);
          clearInterval(oneSecond);
        }, 1000);
      } else {
        if (rooms[roomNum]) {
          socket.in(roomNum).emit("checkRound", {
            nameOne: rooms[roomNum][0].userName,
            actionOne: rooms[roomNum][0].action,
            nameTwo: rooms[roomNum][1].userName,
            actionTwo: rooms[roomNum][1].action,
          });
          socket.emit("checkRound", {
            nameOne: rooms[roomNum][0].userName,
            actionOne: rooms[roomNum][0].action,
            nameTwo: rooms[roomNum][1].userName,
            actionTwo: rooms[roomNum][1].action,
          });
          rooms[roomNum][0].action = null;
          rooms[roomNum][1].action = null;
          roundTime(Number(settings[roomNum].gameTime) + 1, roomNum);
        }
      }
    }
  };

  //////////////////////////////////////////////////
  const openingTimeForTest = (time, timeForRoundInTest) => {
    const userToStartTest = users.filter((x) => x.id === socket.id);
    const findUserToStartTest = users.indexOf(userToStartTest[0]);
    if (findUserToStartTest !== -1) {
      if (users[findUserToStartTest].action === "battelPc") {
        if (time > 0) {
          const oneSecond = setInterval(() => {
            console.log(time);
            time--;
            socket.emit("openingTestFromServer", time);
            openingTimeForTest(time, timeForRoundInTest);
            clearInterval(oneSecond);
          }, 1000);
        } else {
          console.log("opening time over");
          roundTimeForTest(
            Number(timeForRoundInTest) + 1,
            Number(timeForRoundInTest) + 1
          );
        }
      }
    }
  };

  const roundTimeForTest = (time, timeForRoundInTest) => {
    const userToStartTest = users.filter((x) => x.id === socket.id);
    const findUserToStartTest = users.indexOf(userToStartTest[0]);
    if (findUserToStartTest !== -1) {
      if (users[findUserToStartTest].action === "battelPc") {
        if (time > 0) {
          const oneSecond = setInterval(() => {
            console.log(time);
            time--;
            socket.emit("roundInTestFromServer", time);
            roundTimeForTest(time, timeForRoundInTest);
            clearInterval(oneSecond);
          }, 1000);
        } else {
          let pcAction;
          console.log("BOOM-start", users[findUserToStartTest].pcCtr);
          if (
            users[findUserToStartTest].pcCtr === undefined ||
            users[findUserToStartTest].pcCtr === null ||
            users[findUserToStartTest].pcCtr === 0
          ) {
            users[findUserToStartTest].pcCtr = 0;
            pcAction = Math.floor(Math.random() * 2) + 1;
          } else if (users[findUserToStartTest].pcCtr > 0) {
            pcAction = Math.floor(Math.random() * 3) + 1;
          }
          console.log("BOOMBOOM111", pcAction);

          if (pcAction === 1) {
            pcAction = "shield";
          } else if (pcAction === 2) {
            pcAction = "load";
            users[findUserToStartTest].pcCtr =
              users[findUserToStartTest].pcCtr + 1;
          } else if (pcAction === 3) {
            pcAction = "shot";
            users[findUserToStartTest].pcCtr =
              users[findUserToStartTest].pcCtr - 1;
          }
          console.log("BOOMBOOM222", users[findUserToStartTest].pcCtr);
          console.log("BOOMBOOM333", pcAction);

          socket.emit("checkRound", pcAction);

          roundTimeForTest(
            Number(timeForRoundInTest),
            Number(timeForRoundInTest)
          );
        }
      }
    }
  };
  ///////////////////////////////////////////

  socket.on("checkIfNameValid", (userNameInput, answer) => {
    const isNameExsist = users.filter((x) => x.userName === userNameInput);
    console.log("checkIfNameValid: ", userNameInput, isNameExsist);
    if (isNameExsist.length === 0) {
      answer(false);
    } else {
      answer(true);
    }
  });

  socket.on("pushToNamesArrInServer", (userNameInput) => {
    console.log("pushToNamesArrInServer: ", userNameInput);
    users.push({
      userName: userNameInput,
      id: socket.id,
      where: "Welcome",
      action: null,
    });
    console.table(users);
  });

  socket.on("updateMe", (userObj) => {
    const userToUpdate = users.filter((x) => x.userName === userObj.userName);
    const findUserToUpdate = users.indexOf(userToUpdate[0]);
    console.log(
      "findUserToUpdate: ",
      userObj,
      findUserToUpdate,
      users[findUserToUpdate]
    );
    if (findUserToUpdate === -1) {
      console.log("findUserToUpdate say: NO USER TO UPDATE!!!!!!");
    } else {
      users[findUserToUpdate].id = userObj.id;
      users[findUserToUpdate].where = userObj.where;
      users[findUserToUpdate].action = userObj.action;
    }
    console.table(users);
  });

  // to do: on disconnect

  socket.on("tryToConnectFromFront", (playerToCall, me, answer) => {
    const isNameExsist = users.filter((x) => x.userName === playerToCall);
    console.log(
      "tryToConnectFromFront: ",
      playerToCall,
      isNameExsist,
      socket.id,
      me
    );
    if (isNameExsist.length === 0) {
      answer("notExistOrNotOnline");
    } else {
      if (isNameExsist[0].roomNum) {
        answer("inGameNow");
      } else {
        answer("waitingForAnswerFromUser");
        socket.to(isNameExsist[0].id).emit("invitation", me);
      }
    }
  });

  socket.on("diclineGameOffer", (plyaerDecline, opponentOfferDecline) => {
    socket
      .to(opponentOfferDecline.id)
      .emit("yourOfferHasBeenDeclined", plyaerDecline.id);
  });

  socket.on(
    "acceptGameOffer",
    (plyaerAccepted, opponentOfferAccepted, answer) => {
      let roomNum = Math.floor(Math.random() * 5000) + 1; //needs to to it with big numbers and chek they not allready exist
      answer(roomNum);
      socket
        .to(opponentOfferAccepted.id)
        .emit("yourOfferHasBeenAccepted", plyaerAccepted, roomNum);
    }
  );

  socket.on("joinMeToRoom", (me, roomNum) => {
    console.log("server: -JOIM ME TO ROOM-JOIM ME TO ROOM-JOIM ME TO ROOM");
    console.log("roomNum:", roomNum);
    console.log("me.id", me.id, me);
    console.log("socket.id", socket.id);
    // console.log(socket.rooms);
    socket.join(roomNum);
    console.log("ROOMS:");
    console.table(rooms);
    const userToUpdate = users.filter((x) => x.userName === me.userName);
    const findUserToUpdate = users.indexOf(userToUpdate[0]);
    users[findUserToUpdate].roomNum = roomNum;
    console.log("nanana");
    console.log(users[findUserToUpdate]);
    if (rooms[roomNum]) {
      rooms[roomNum].push(me);
    } else {
      rooms[roomNum] = [me];
    }
    console.table(rooms);
    console.log("END 2");
  });

  socket.on("gameSettings", (roomNum, gameTime, gameLives) => {
    console.log("gameSettings");
    console.log("roomNum", roomNum);
    console.log("gameTime", gameTime);
    console.log("gameLives", gameLives);
    settings[roomNum] = {
      gameTime,
      gameLives,
    };
    console.log("settings[roomNum]: ", settings[roomNum]);
  });

  socket.on("meReadyToPlay", (me, opponent, readyOrNot, roomNum) => {
    console.log("server: meReadyToPlay");
    console.log("me.id", me.id);
    console.log("opponent.id", opponent.id);
    console.log("socket.id", socket.id);
    console.log("roomNum", roomNum);

    socket.in(roomNum).emit("opponentIsReadyToPlay", me, readyOrNot);
  });
  socket.on("openingGame", async (roomNum) => {
    if (
      settings[roomNum].gamingNow === undefined ||
      settings[roomNum].gamingNow === false
    ) {
      console.log("openingGame");
      console.log("roomNum", roomNum);
      settings[roomNum].gamingNow = true;
      openingTime(4, roomNum);
    }
  });

  socket.on("openingTest", (timeInRoundInTest) => {
    console.log("openingTest");
    const userToStartTest = users.filter((x) => x.id === socket.id);
    const findUserToStartTest = users.indexOf(userToStartTest[0]);
    users[findUserToStartTest].action = "battelPc";
    console.log("battelPc");
    console.log(users[findUserToStartTest]);
    openingTimeForTest(4, timeInRoundInTest);
  });

  socket.on("endTest", () => {
    console.log("endTest");
    const userToStartTest = users.filter((x) => x.id === socket.id);
    const findUserToStartTest = users.indexOf(userToStartTest[0]);
    if (findUserToStartTest !== -1) {
      users[findUserToStartTest].action = null;
      users[findUserToStartTest].pcCtr = 0;
      console.log("endTest=> battelPc to null");
      console.log(users[findUserToStartTest]);
    }
  });

  socket.on("myAction", (roomNum, myAction) => {
    if (rooms[roomNum]) {
      const findUserToUpdateAction = rooms[roomNum].filter(
        (x) => x.id === socket.id
      );
      console.log("231", findUserToUpdateAction);
      if (findUserToUpdateAction.length === 1) {
        if (findUserToUpdateAction[0].action === undefined) {
          findUserToUpdateAction[0].action = myAction;
        } else {
          findUserToUpdateAction[0].action = myAction;
        }
        console.log(findUserToUpdateAction[0]);
      }
    }
  });
  socket.on("gameOver", (roomNum) => {
    settings[roomNum].gamingNow = false;

    if (rooms[roomNum]) {
      if (rooms[roomNum][0] !== undefined) {
        rooms[roomNum][0].action = null;
      }
      if (rooms[roomNum][1] !== undefined) {
        rooms[roomNum][1].action = null;
      }
    }
  });
  socket.on("rematchOffer", (roomNum, opponent, answer) => {
    console.log("rematchOffer");
    const stilHere = rooms[roomNum].filter(
      (x) => x.userName === opponent.userName
    );
    const isHe = stilHere[0];
    console.log("stilHere -stilHerestilHerestilHere ");
    console.log(stilHere, isHe);

    if (stilHere.length === 0) {
      answer(false);
    } else {
      answer(true);
      socket.in(roomNum).emit("rematchOfferToYou");
    }
  });

  socket.on("leaveRoom", (roomNum) => {
    console.log(`leaveRoom - rooms 1:`);
    console.log(roomNum);
    console.table(users);
    console.table(rooms);

    socket.leave(roomNum);

    // update room null for the leaving user in USERS
    const userToUpdate = users.filter((x) => x.id === socket.id);
    const findUserToUpdate = users.indexOf(userToUpdate[0]);
    if (users[findUserToUpdate]) {
      users[findUserToUpdate].roomNum = null;
      users[findUserToUpdate].action = null;
      users[findUserToUpdate].pcCtr = 0;
    }
    console.log(`leaveRoom - rooms 2:`);
    console.log(users[findUserToUpdate]);
    console.log(roomNum);
    console.table(users);

    // update player leaving the room in ROOMS
    if (rooms[roomNum]) {
      settings[roomNum].gamingNow = false;
      const leavingUser = rooms[roomNum].findIndex((x) => x.id === socket.id);
      console.log("leavingUserINDEX: ", leavingUser);
      rooms[roomNum].splice(leavingUser, 1);

      console.log(`leaveRoom - rooms 2:`);
      console.table(rooms[roomNum]);
      console.table(rooms);
      if (rooms[roomNum].length === 0) {
        delete rooms[roomNum];
        console.log(`DELETE ROOM:`);
        console.table(rooms);
      } else {
        socket.in(roomNum).emit("oppenentLeftTheGame");

        // const timeTemp = setTimeout(() => {
        //   delete rooms[roomNum];
        //   console.log(`leaveRoom - rooms 3:`);
        //   console.table(rooms);
        //   clearTimeout(timeTemp);
        // }, 4000);
      }
    }
  });

  socket.on("disconnect", (e) => {
    socket.leave();

    for (const key in rooms) {
      rooms[key].map((player, playerInd) => {
        // console.log(`${key}: ${rooms[key][0].userName}`);
        // console.log(`${key}: ${player.userName}`);

        if (player.id === socket.id) {
          // console.log(`player: ${player.userName}. socket.id: ${socket.id}`);

          console.log(`rooms: 1`);
          console.table(rooms);
          rooms[key].splice(playerInd, 1);
          console.log(`rooms: 2`);
          console.table(rooms);
          settings[Number(key)].gamingNow = false;
          if (rooms[key].length === 0) {
            delete rooms[key];
          } else {
            socket.in(Number(key)).emit("oppenentLeftTheGame");

            const timeTemp = setTimeout(() => {
              delete rooms[key];
              console.log(`rooms: 3`);
              console.table(rooms);
              clearTimeout(timeTemp);
            }, 4000);
          }
        }
      });
    }
    console.log("users:1");
    console.table(users);
    users.map((player, playerInd) => {
      if (player.id === socket.id) {
        users.splice(playerInd, 1);
      }
    });
    console.log("users:2");
    console.table(users);
  });
});

admin.on("connection", (socket) => {
  socket.on("someoneInAdminPage", (answer) => {
    answer({ users, rooms });
  });

  socket.on("verifyAdminPassword", (pass, answer) => {
    if (pass === "zoharAdmin2022") {
      answer(true);
    } else {
      answer(false);
    }
  });
});

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

const PORT = process.env.PORT || 3016;
// listen to server
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
