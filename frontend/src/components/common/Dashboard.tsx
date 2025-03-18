import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playerApi, meetingApi, gameApi, statsApi } from "../../services/api";
import { Player, Meeting, Game } from "../../types";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Chart.js 컴포넌트 등록
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsData {
  popular_games: Array<{ id: number; name: string; count: number }>;
  top_winners: Array<{
    id: number;
    name: string;
    win_rate: number;
    wins: number;
    plays: number;
  }>;
  active_players: Array<{ id: number; name: string; meeting_count: number }>;
  player_counts: {
    labels: string[];
    data: number[];
  };
}

const Dashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 병렬로 데이터 가져오기
        const [playersData, meetingsData, gamesData, statsData] =
          await Promise.all([
            playerApi.getAll(),
            meetingApi.getAll(),
            gameApi.getAll(),
            statsApi.getStats(),
          ]);

        setPlayers(playersData);
        setMeetings(meetingsData);
        setGames(gamesData);
        setStats(statsData);
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

  // 인기 게임 차트 데이터
  const popularGamesChartData = {
    labels: stats?.popular_games.map((game) => game.name) || [],
    datasets: [
      {
        label: "게임 횟수",
        data: stats?.popular_games.map((game) => game.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(201, 203, 207, 0.7)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
          "rgb(255, 159, 64)",
          "rgb(201, 203, 207)",
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // 플레이어 수별 게임 차트 데이터
  const playerCountChartData = {
    labels: stats?.player_counts.labels || [],
    datasets: [
      {
        label: "인원별 게임 횟수",
        data: stats?.player_counts.data || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
      },
    ],
  };

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

      {/* 통계 차트 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">인기 게임</h5>
            </div>
            <div className="card-body">
              {stats?.popular_games && stats.popular_games.length > 0 ? (
                <div style={{ maxHeight: "300px" }}>
                  <Pie
                    data={popularGamesChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              ) : (
                <div className="alert alert-info">게임 기록이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">인원별 게임 통계</h5>
            </div>
            <div className="card-body">
              {stats?.player_counts &&
              stats.player_counts.data.some((count) => count > 0) ? (
                <div style={{ maxHeight: "300px" }}>
                  <Pie
                    data={playerCountChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              ) : (
                <div className="alert alert-info">게임 기록이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">최다 승리 플레이어</h5>
            </div>
            <div className="card-body">
              {stats?.top_winners && stats.top_winners.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>순위</th>
                        <th>플레이어</th>
                        <th>승리</th>
                        <th>참여</th>
                        <th>승률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.top_winners.map((player, index) => (
                        <tr key={player.id}>
                          <td>{index + 1}</td>
                          <td>
                            <Link
                              to={`/players/${player.id}`}
                              className="text-decoration-none"
                            >
                              {player.name}
                            </Link>
                          </td>
                          <td>{player.wins}</td>
                          <td>{player.plays}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="progress flex-grow-1 me-2"
                                style={{ height: "8px" }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${player.win_rate}%` }}
                                  aria-valuenow={player.win_rate}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                              <span>{player.win_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  플레이어 기록이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">모임 참여 순위</h5>
            </div>
            <div className="card-body">
              {stats?.active_players && stats.active_players.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>순위</th>
                        <th>플레이어</th>
                        <th>참석 모임</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.active_players.map((player, index) => (
                        <tr key={player.id}>
                          <td>{index + 1}</td>
                          <td>
                            <Link
                              to={`/players/${player.id}`}
                              className="text-decoration-none"
                            >
                              {player.name}
                            </Link>
                          </td>
                          <td>{player.meeting_count}회</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  모임 참여 기록이 없습니다.
                </div>
              )}
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
