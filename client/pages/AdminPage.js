import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import url from "../url";

const socket = io.connect(url + "/admin");

const VerifyAdmin = (props) => {
  const adminPassInput = useRef();

  const checkAdminPass = async (e) => {
    e.preventDefault();
    socket.emit(
      "verifyAdminPassword",
      adminPassInput.current.value,
      (answer) => {
        if (answer) {
          props.setIsThisAdmin(true);
        } else {
          alert("YOU ARE NOT THE ADMIN! GO AWAY!");
          return;
        }
      }
    );
  };

  return (
    <div className="adminVerPopUp">
      <form className="adminPassForm" typeof="submit">
        <h4 className="userNameHeadline">WELCOME DOT</h4>
        <h4 className="userNameHeadline">Enter your password</h4>

        <input
          className="userNameFormInput gameInput"
          placeholder="Admin password only!"
          ref={adminPassInput}
        ></input>
        <br />

        <button
          className="gameBtnBig adminBtn"
          onClick={(e) => {
            checkAdminPass(e);
          }}
        >
          ENTER
        </button>
      </form>
    </div>
  );
};

function AdminPage() {
  const [roomsFromServer, setRoomsFromServer] = useState();
  const [isThisAdmin, setIsThisAdmin] = useState(false);
  const [whosHere, setWhosHere] = useState();

  useEffect(() => {
    if (isThisAdmin) {
      updateInfo();
    }
  }, [isThisAdmin]);

  const updateInfo = () => {
    socket.emit("someoneInAdminPage", (answer) => {
      let tempRooms = answer.rooms;
      let tempRoomsArray = [];
      for (const property in tempRooms) {
        tempRoomsArray.push({ [property]: tempRooms[property] });
      }
      setRoomsFromServer(tempRoomsArray);
      setWhosHere(answer.users);
    });
  };
  return (
    <div className="adminContainer battlePageDiv">
      {isThisAdmin ? (
        <>
          <div className="navBarAdmin">
            <button
              className="adminUpdateBtn gameBtnMed"
              onClick={() => {
                updateInfo();
              }}
            >
              Update
            </button>
            <h1>Admin Page</h1>
          </div>
          <div className="counterDiv">
            <h5 className="counterText">
              מספר אנשים באתר כרגע: {whosHere ? whosHere.length : "temp"}
            </h5>
          </div>
          <div className="whosHereDiv">
            <table className="adminNamesTable">
              <tbody>
                <tr className="headLinesRow">
                  <th className="headLinesForUsersList">שם משתמש:</th>
                  <th className="headLinesForUsersList">איפה הוא נמצא:</th>
                </tr>
                {whosHere
                  ? whosHere.map((player, index) => {
                      return (
                        <tr className="rowInTableNames" key={index}>
                          <td className="coli">{player.userName}</td>
                          <td className="coli">{player.where}</td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
          <table className="adminRoomsTable">
            <tbody>
              <tr className="headLinesRow">
                <th className="headLinesForRoomsList">מס' חדר:</th>
                <th className="headLinesForUsersList">משתמשים בחדר:</th>
                <th className="headLinesForUsersList">ת.ז משתמש</th>
              </tr>
              {roomsFromServer
                ? roomsFromServer.map((element, index) => {
                    let objKey = [Object.keys(element)[0]];
                    return (
                      <tr className="rowInTable" key={index}>
                        <td className="">{objKey}</td>

                        <td className="usersColInAdminTable">
                          {element[objKey].map((e, i) => {
                            return (
                              <div key={i}>
                                {i + 1}. {e.userName}
                              </div>
                            );
                          })}
                        </td>

                        <td className="usersIdColInAdminTable">
                          {element[objKey].map((e, i) => {
                            return <div key={i}>{e.id}</div>;
                          })}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </>
      ) : (
        <VerifyAdmin setIsThisAdmin={setIsThisAdmin} />
      )}
    </div>
  );
}

export default AdminPage;
