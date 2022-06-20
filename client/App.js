import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import useLocalStorage from "./hooks/useLocalStorage";

import WelcomePage from "./pages/WelcomePage";
import HomePage from "./pages/HomePage";

import PcGame from "./pages/PcGame";

import SetBattlePage from "./pages/SetBattlePage";
import BattlePage from "./pages/BattlePage";

import AdminPage from "./pages/AdminPage";

function App() {
  const [userName, setUserName] = useLocalStorage("userName");
  const [roomNum, setRoomNum] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [isBeingInvited, setIsBeingInvited] = useState(false);
  const [settings, setSettings] = useState({
    gameTime: 3,
    gameLives: 2,
  });
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <WelcomePage userName={userName} setUserName={setUserName} />
            }
          />
          <Route
            path="home"
            element={
              <HomePage
                userName={userName}
                isBeingInvited={isBeingInvited}
                setIsBeingInvited={setIsBeingInvited}
                setOpponent={setOpponent}
                opponent={opponent}
                roomNum={roomNum}
                setRoomNum={setRoomNum}
              />
            }
          />

          <Route
            path="pcgame"
            element={
              <PcGame
                userName={userName}
                isBeingInvited={isBeingInvited}
                setIsBeingInvited={setIsBeingInvited}
                setOpponent={setOpponent}
                opponent={opponent}
                roomNum={roomNum}
                setRoomNum={setRoomNum}
              />
            }
          />

          <Route
            path="setbattle"
            element={
              <SetBattlePage
                userName={userName}
                isBeingInvited={isBeingInvited}
                setIsBeingInvited={setIsBeingInvited}
                opponent={opponent}
                setOpponent={setOpponent}
                settings={settings}
                setSettings={setSettings}
                roomNum={roomNum}
                setRoomNum={setRoomNum}
              />
            }
          />

          <Route
            path="battle/:players"
            element={
              <BattlePage
                userName={userName}
                isBeingInvited={isBeingInvited}
                setIsBeingInvited={setIsBeingInvited}
                opponent={opponent}
                settings={settings}
                setSettings={setSettings}
                setOpponent={setOpponent}
                roomNum={roomNum}
                setRoomNum={setRoomNum}
              />
            }
          />
          <Route path="admin" element={<AdminPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
