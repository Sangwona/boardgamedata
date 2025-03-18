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
import StandaloneGameRecordForm from "./components/gameRecord/StandaloneGameRecordForm";
import NotFound from "./components/common/NotFound";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <main className="container flex-grow-1 py-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* 플레이어 관련 라우트 */}
          <Route path="/players" element={<PlayerList />} />
          <Route path="/players/add" element={<PlayerForm />} />
          <Route path="/players/edit/:id" element={<PlayerForm />} />
          <Route path="/players/:id" element={<PlayerDetail />} />

          {/* 미팅 관련 라우트 */}
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/meetings/add" element={<MeetingForm />} />
          <Route path="/meetings/edit/:id" element={<MeetingForm />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />

          {/* 게임 관련 라우트 */}
          <Route path="/games" element={<GameList />} />
          <Route path="/games/add" element={<GameForm />} />
          <Route path="/games/:id" element={<GameDetail />} />

          {/* 게임 기록 관련 라우트 */}
          <Route
            path="/meetings/:meetingId/records/add"
            element={<GameRecordForm />}
          />
          <Route
            path="/game-records/add"
            element={<StandaloneGameRecordForm />}
          />

          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
