import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { playerApi, statsApi } from "../../services/api";
import { Player } from "../../types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PlayerStats {
  most_played_games: Array<{
    id: number;
    name: string;
    plays: number;
    wins: number;
    win_rate: number;
  }>;
  total_plays: number;
  total_wins: number;
  win_rate: number;
}

const PlayerDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const playerId = params.id;
  console.log("현재 URL 파라미터:", params);

  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) {
        console.error("플레이어 ID가 없습니다.");
        setError("플레이어 ID가 없습니다.");
        setLoading(false);
        return;
      }

      console.log("플레이어 데이터 요청 시작:", playerId);

      try {
        setLoading(true);
        // 병렬로 데이터 가져오기
        const [playerData, statsData] = await Promise.all([
          playerApi.getById(parseInt(playerId)),
          statsApi.getPlayerStats(parseInt(playerId)),
        ]);

        console.log("플레이어 데이터 성공:", playerData);
        console.log("통계 데이터 성공:", statsData);

        setPlayer(playerData);
        setPlayerStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching player details:", err);
        setError("플레이어 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  const handleDelete = async () => {
    if (
      !player ||
      !window.confirm(`정말로 ${player.name} 플레이어를 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      await playerApi.delete(player.id);
      navigate("/players");
    } catch (err) {
      console.error("Error deleting player:", err);
      setError("플레이어 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
        <div className="mt-3">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">오류 발생!</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          <Link to="/players" className="alert-link">
            플레이어 목록으로 돌아가기
          </Link>
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">플레이어를 찾을 수 없습니다.</h4>
        <p>요청하신 ID({playerId})에 해당하는 플레이어 정보가 없습니다.</p>
        <hr />
        <p className="mb-0">
          <Link to="/players" className="alert-link">
            플레이어 목록으로 돌아가기
          </Link>
        </p>
      </div>
    );
  }

  // 게임 플레이 통계 차트 데이터
  const gameStatsChartData = {
    labels: playerStats?.most_played_games.map((game) => game.name) || [],
    datasets: [
      {
        label: "참여 횟수",
        data: playerStats?.most_played_games.map((game) => game.plays) || [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 0.8)",
        borderWidth: 1,
      },
      {
        label: "승리 횟수",
        data: playerStats?.most_played_games.map((game) => game.wins) || [],
        backgroundColor: "rgba(75, 192, 92, 0.5)",
        borderColor: "rgba(75, 192, 92, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>플레이어 상세 정보</h2>
        <div className="d-flex gap-2">
          <Link to="/players" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> 목록으로
          </Link>
          <Link
            to={`/players/edit/${player.id}`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil me-1"></i> 수정
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> 삭제
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">기본 정보</h4>
            </div>
            <div className="card-body">
              <h2 className="card-title">{player.name}</h2>
              {player.nickname && (
                <p className="card-text">
                  <strong>별명:</strong> {player.nickname}
                </p>
              )}
              <div className="mt-3">
                <strong>MBTI:</strong> {player.mbti || "미설정"}
              </div>
              <div className="mt-3">
                <strong>출생년도:</strong> {player.birth_year || "미설정"}
              </div>
              <div className="mt-3">
                <strong>지역:</strong> {player.location || "미설정"}
              </div>
              {player.comment && (
                <div className="mt-3">
                  <strong>코멘트:</strong>
                  <p className="card-text mt-2">{player.comment}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">게임 통계</h4>
            </div>
            <div className="card-body">
              {playerStats ? (
                <>
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="card h-100 border-light bg-light">
                        <div className="card-body text-center">
                          <h6 className="card-title">총 게임 참여</h6>
                          <h2 className="card-text display-5">
                            {playerStats.total_plays}회
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 border-light bg-light">
                        <div className="card-body text-center">
                          <h6 className="card-title">총 승리</h6>
                          <h2 className="card-text display-5">
                            {playerStats.total_wins}회
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 border-light bg-light">
                        <div className="card-body text-center">
                          <h6 className="card-title">승률</h6>
                          <h2 className="card-text display-5">
                            {playerStats.win_rate}%
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  {playerStats.most_played_games.length > 0 ? (
                    <div className="mt-4">
                      <h5 className="mb-3">게임별 승률</h5>
                      <div style={{ height: "300px" }}>
                        <Bar
                          data={gameStatsChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                            plugins: {
                              legend: {
                                position: "top",
                              },
                              title: {
                                display: true,
                                text: "게임별 참여 및 승리 통계",
                              },
                            },
                          }}
                        />
                      </div>

                      <div className="table-responsive mt-4">
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th>게임명</th>
                              <th>참여</th>
                              <th>승리</th>
                              <th>승률</th>
                            </tr>
                          </thead>
                          <tbody>
                            {playerStats.most_played_games.map((game) => (
                              <tr key={game.id}>
                                <td>
                                  <Link
                                    to={`/games/${game.id}`}
                                    className="text-decoration-none"
                                  >
                                    {game.name}
                                  </Link>
                                </td>
                                <td>{game.plays}회</td>
                                <td>{game.wins}회</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div
                                      className="progress flex-grow-1 me-2"
                                      style={{ height: "8px" }}
                                    >
                                      <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${game.win_rate}%` }}
                                        aria-valuenow={game.win_rate}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                      ></div>
                                    </div>
                                    <span>{game.win_rate}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info mt-3">
                      아직 게임 기록이 없습니다.
                    </div>
                  )}
                </>
              ) : (
                <div className="alert alert-info">
                  게임 통계 정보를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
