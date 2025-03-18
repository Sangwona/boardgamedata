import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { playerApi } from "../../services/api";
import { Player, GameResult } from "../../types";

const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      try {
        setLoading(true);
        const data = await playerApi.getById(parseInt(playerId!));
        setPlayer(data);
        setGameHistory(data.game_history || []);
      } catch (err) {
        setError("플레이어 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching player details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerDetail();
    }
  }, [playerId]);

  const handleDelete = async () => {
    if (window.confirm("정말로 이 플레이어를 삭제하시겠습니까?")) {
      try {
        await playerApi.delete(parseInt(playerId!));
        navigate("/players");
      } catch (err) {
        setError("플레이어 삭제에 실패했습니다.");
        console.error("Error deleting player:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error || "플레이어 정보를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{player.name}</h2>
        <div className="btn-group">
          <Link
            to={`/players/${playerId}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil me-1"></i> 수정
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> 삭제
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">플레이어 정보</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>이름:</strong> {player.name}
              </p>
              <p>
                <strong>출생년도:</strong> {player.birth_year}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>MBTI:</strong> {player.mbti}
              </p>
              <p>
                <strong>지역:</strong> {player.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">게임 기록</h5>
        </div>
        <div className="card-body">
          {gameHistory.length === 0 ? (
            <div className="alert alert-info mb-0">게임 기록이 없습니다.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>날짜</th>
                    <th>장소</th>
                    <th>게임</th>
                    <th>점수</th>
                    <th>결과</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{record.meeting_date}</td>
                      <td>{record.meeting_location}</td>
                      <td>{record.game_name}</td>
                      <td>{record.score}</td>
                      <td>
                        {record.is_winner ? (
                          <span className="badge bg-success">승리</span>
                        ) : (
                          <span className="badge bg-secondary">패배</span>
                        )}
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

export default PlayerDetail;
