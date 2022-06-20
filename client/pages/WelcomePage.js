import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from "react-router-dom";
import io from "socket.io-client";
import url from "../url";

const socket = io.connect(url + "/");

function WelcomePage(props) {
  const navigate = useNavigate();
  const userNameInput = useRef();
  const userNameMsg = useRef();
  const [isNameValid, setIsNameValid] = useState(null);

  const checkIfNameValid = () => {
    socket.emit("checkIfNameValid", userNameInput.current.value, (answer) => {
      if (answer === true) {
        userNameMsg.current.value = "invalid name";
        setIsNameValid(false);
      } else {
        userNameMsg.current.value = "valid name";
        setIsNameValid(true);
      }
    });
  };

  const checkNameAndGo = (e) => {
    e.preventDefault();

    if (
      userNameInput.current.value === "" ||
      userNameInput.current.value === null
    ) {
      alert("אנא הכנס שם כדי להמשיך =)");
      return;
    } else if (!isNameValid) {
      alert("אנא בחר שם אחר. שם זה תפוס");
    } else {
      props.setUserName(userNameInput.current.value);
      socket.emit("pushToNamesArrInServer", userNameInput.current.value);
      navigate(`/home`);
    }
  };

  return (
    <div className="battlePageDiv">
      <div className="navBar">
        <h3 className="">Fastaet Gun</h3>
      </div>

      <h6 className="">שפרו את יכולות שלכם במשחק מול המחשב ושחקו נגד חברים</h6>
      <h4 className="">הכנס את שמך:</h4>
      <div className="">
        <form className="" typeof="submit">
          <input
            className="gameInput"
            onChange={() => {
              checkIfNameValid();
            }}
            ref={userNameInput}
            placeholder="שם שחקן"
            type="text"
          ></input>
          <br />
          <span
            className=""
            style={{ color: isNameValid ? "green" : "red" }}
            ref={userNameMsg}
          >
            {userNameMsg.current ? userNameMsg.current.value : null}
          </span>
          <br />
          <button
            className="gameBtnMed"
            onClick={(e) => {
              checkNameAndGo(e);
            }}
          >
            המשך
          </button>
        </form>
      </div>
    </div>
  );
}

export default WelcomePage;
