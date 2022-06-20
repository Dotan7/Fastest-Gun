import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Invitation from "../comps/Invitation";

import io from "socket.io-client";
import url from "../url";
const socket = io.connect(url + "/");

function HomePage(props) {
  const navigate = useNavigate();
  const [me, setMe] = useState();
  const firstEnter = useRef(true);

  useEffect(() => {
    if (firstEnter.current) {
      setMe({ userName: props.userName, id: socket.id });
      firstEnter.current = false;
      socket.emit("updateMe", {
        userName: props.userName,
        id: socket.id,
        where: "Home",
        action: null,
      });

      socket.on("invitation", (userInviteYou) => {
        props.setOpponent(userInviteYou);
        props.setIsBeingInvited(true);
      });
    }
  }, []);
  useEffect(() => {
    if (!props.userName) {
      navigate("/");
    }
  }, [props.userName]);

  const acceptOrDeclineGame = (yesOrNo) => {
    if (yesOrNo === "yes") {
      props.setIsBeingInvited(false);
      socket.emit("acceptGameOffer", me, props.opponent, (answer) => {
        props.setRoomNum(answer);
        navigate(`/battle/${props.opponent.userName}-vs-${props.userName}`);
      });
    } else if (yesOrNo === "no") {
      props.setIsBeingInvited(false);
      socket.emit("diclineGameOffer", me, props.opponent);
      props.setOpponent(null);
    }
  };
  return (
    <div className="battlePageDiv">
      {props.isBeingInvited ? (
        <Invitation
          opponent={props.opponent}
          acceptOrDeclineGame={acceptOrDeclineGame}
          userName={props.userName}
        />
      ) : null}
      <div className="navBar">
        <h3 className="">היי {props.userName} =)</h3>
      </div>
      <h6 className="">בחר/י אם לשחק נגד מחשב או נגד חבר/ה</h6>

      <div className="homePageBtnsOptionsDiv">
        <button
          className="gameBtnBig hpBtns"
          onClick={() => {
            navigate("/pcgame");
          }}
        >
          שחקו נגד המחשב
        </button>

        <button
          className="gameBtnBig hpBtns"
          onClick={() => {
            navigate("/setbattle");
          }}
        >
          שחקו נגד חברים
        </button>
      </div>
    </div>
  );
}

export default HomePage;
