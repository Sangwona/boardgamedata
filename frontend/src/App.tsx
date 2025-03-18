import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Dashboard from "./components/common/Dashboard";
import PlayerList from "./components/player/PlayerList";
import PlayerDetail from "./components/player/PlayerDetail";
import PlayerForm from "./components/player/PlayerForm";
import MeetingList from "./components/meeting/MeetingList";
import MeetingDetail from "./components/meeting/MeetingDetail";
import MeetingForm from "./components/meeting/MeetingForm";
import GameList from "./components/game/GameList";
import GameDetail from "./components/game/GameDetail";
import GameForm from "./components/game/GameForm";
import GameRecordForm from "./components/gameRecord/GameRecordForm";
import NotFound from "./components/common/NotFound";
import "./App.css";

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <main className="container flex-grow-1 py-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* 플레이어 관련 라우트 */}
          <Route path="/players" element={<PlayerList />} />
          <Route path="/players/:playerId" element={<PlayerDetail />} />
          <Route path="/players/add" element={<PlayerForm />} />
          <Route path="/players/:playerId/edit" element={<PlayerForm />} />

          {/* 모임 관련 라우트 */}
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/meetings/:meetingId" element={<MeetingDetail />} />
          <Route path="/meetings/add" element={<MeetingForm />} />
          <Route path="/meetings/:meetingId/edit" element={<MeetingForm />} />

          {/* 게임 관련 라우트 */}
          <Route path="/games" element={<GameList />} />
          <Route path="/games/:gameId" element={<GameDetail />} />
          <Route path="/games/add" element={<GameForm />} />

          {/* 게임 기록 관련 라우트 */}
          <Route
            path="/meetings/:meetingId/records/add"
            element={<GameRecordForm />}
          />

          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
