import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playerApi, meetingApi, gameApi } from "../../services/api";
import { Player, Meeting, Game } from "../../types";

const Dashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 병렬로 데이터 가져오기
        const [playersData, meetingsData, gamesData] = await Promise.all([
          playerApi.getAll(),
          meetingApi.getAll(),
          gameApi.getAll(),
        ]);

        setPlayers(playersData);
        setMeetings(meetingsData);
        setGames(gamesData);
        setError(null);
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  // 최근 5개의 모임만 표시
  const recentMeetings = meetings
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>대시보드</h2>
        <div className="d-flex gap-2">
          <Link to="/players/add" className="btn btn-outline-primary">
            <i className="bi bi-person-plus me-1"></i> 플레이어 추가
          </Link>
          <Link to="/meetings/add" className="btn btn-outline-primary">
            <i className="bi bi-calendar-plus me-1"></i> 모임 추가
          </Link>
          <Link to="/games/add" className="btn btn-outline-primary">
            <i className="bi bi-controller me-1"></i> 게임 추가
          </Link>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">플레이어</h5>
              <h1 className="display-4">{players.length}</h1>
              <p className="card-text">등록된 플레이어 수</p>
              <Link to="/players" className="btn btn-outline-primary">
                플레이어 목록 보기
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">모임</h5>
              <h1 className="display-4">{meetings.length}</h1>
              <p className="card-text">기록된 모임 수</p>
              <Link to="/meetings" className="btn btn-outline-primary">
                모임 목록 보기
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">게임</h5>
              <h1 className="display-4">{games.length}</h1>
              <p className="card-text">등록된 게임 수</p>
              <Link to="/games" className="btn btn-outline-primary">
                게임 목록 보기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 모임</h5>
              <Link to="/meetings" className="btn btn-sm btn-link">
                모두 보기
              </Link>
            </div>
            <div className="card-body">
              {recentMeetings.length === 0 ? (
                <div className="alert alert-info mb-0">
                  기록된 모임이 없습니다.
                </div>
              ) : (
                <div className="list-group">
                  {recentMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      to={`/meetings/${meeting.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{meeting.date}</h6>
                        <small>{meeting.location}</small>
                      </div>
                      <p className="mb-1">
                        {meeting.description || "설명 없음"}
                      </p>
                      <small>
                        참가자:{" "}
                        {meeting.participants_count +
                          meeting.unregistered_count}
                        명
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 추가된 게임</h5>
              <Link to="/games" className="btn btn-sm btn-link">
                모두 보기
              </Link>
            </div>
            <div className="card-body">
              {games.length === 0 ? (
                <div className="alert alert-info mb-0">
                  등록된 게임이 없습니다.
                </div>
              ) : (
                <div className="list-group">
                  {games.slice(0, 5).map((game) => (
                    <Link
                      key={game.id}
                      to={`/games/${game.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{game.name}</h6>
                        <small>
                          {game.min_players}~{game.max_players}명
                        </small>
                      </div>
                      <p className="mb-1">{game.description || "설명 없음"}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
