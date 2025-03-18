import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { gameApi } from "../../services/api";
import { GameWithStats, PlayerStat } from "../../types";

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getById(parseInt(gameId!));
        setGame(data);
      } catch (err: any) {
        console.error("Error fetching game details:", err);
        const errorMessage =
          err.response?.data?.error ||
          `게임 정보를 불러오는데 실패했습니다. 오류: ${
            err.message || "알 수 없는 오류"
          }`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameDetail();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error || "게임 정보를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{game.name}</h2>
        <div className="btn-group">
          <Link to="/games" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> 목록으로
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">게임 정보</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>이름:</strong> {game.name}
              </p>
              <p>
                <strong>최소 인원수:</strong> {game.min_players}명
              </p>
              <p>
                <strong>최대 인원수:</strong> {game.max_players}명
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>설명:</strong> {game.description || "설명 없음"}
              </p>
              <p>
                <strong>플레이 횟수:</strong> {game.play_count || 0}회
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">통계</h5>
        </div>
        <div className="card-body">
          {!game.stats ||
          !game.stats.players ||
          game.stats.players.length === 0 ? (
            <div className="alert alert-info">아직 플레이 기록이 없습니다.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>플레이어</th>
                    <th>승리</th>
                    <th>플레이</th>
                    <th>승률</th>
                  </tr>
                </thead>
                <tbody>
                  {game.stats.players
                    .sort((a, b) => b.win_rate - a.win_rate)
                    .map((stat, index) => (
                      <tr key={index}>
                        <td>
                          <Link
                            to={`/players/${stat.player_id}`}
                            className="text-decoration-none"
                          >
                            {stat.player_name}
                          </Link>
                        </td>
                        <td>{stat.wins}회</td>
                        <td>{stat.plays}회</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="progress flex-grow-1 me-2"
                              style={{ height: "8px" }}
                            >
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${stat.win_rate}%` }}
                                aria-valuenow={stat.win_rate}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <span>{stat.win_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
