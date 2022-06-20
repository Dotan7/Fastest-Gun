import React, { useState, useEffect, useRef } from "react";

function SettingsOption(props) {
  const [gameTime, setGameTime] = useState(
    props.settings.gameTime ? props.settings.gameTime : 3
  );
  const [gameLives, setGameLives] = useState(
    props.settings.gameLives ? props.settings.gameLives : 2
  );

  useEffect(() => {
    props.setSettings({
      gameTime: gameTime,
      gameLives: gameLives,
    });
  }, [gameTime, gameLives]);

  return (
    <div className="settingsOptionCompDiv">
      <h4 className="headLineSettingOptionsMenu">הגדר את המשחק: </h4>

      <div className="">
        <div className="">
          <label htmlFor="">זמן לסיבוב: </label>

          <input
            type="number"
            className="gameInput numQuestInput"
            id=""
            placeholder={
              props.settings.gameTime > 0 ? props.settings.gameTime : 3
            }
            style={{ width: "30px" }}
            onChange={(e) => {
              e.target.value > 0
                ? setGameTime(e.target.value)
                : (e.target.value = 0);
            }}
          />
        </div>

        <div className="">
          <label htmlFor="">חיים: </label>

          <input
            type="number"
            className="gameInput numQuestInput"
            id=""
            placeholder={
              props.settings.gameLives > 0 ? props.settings.gameLives : 2
            }
            style={{ width: "30px" }}
            onChange={(e) => {
              e.target.value > 0
                ? setGameLives(e.target.value)
                : (e.target.value = 0);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsOption;
