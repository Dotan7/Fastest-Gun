import React from "react";
function Invitation(props) {
  return (
    <div className="invitationCompDiv">
      <div className="textInInvintCompDiv">
        <span className="playerNameInInvintComp">
          {props.opponent.userName}
        </span>
        <span className="textInInvintComp"> מזמין אותך למשחק </span>
      </div>
      <button
        className="acceptBtnInInvintComp"
        onClick={() => {
          props.acceptOrDeclineGame("yes");
        }}
      >
        שחק!
      </button>
      <button
        className="declineBtnInInvintComp"
        onClick={() => {
          props.acceptOrDeclineGame("no");
        }}
      >
        דחה
      </button>
    </div>
  );
}

export default Invitation;
