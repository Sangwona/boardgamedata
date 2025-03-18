import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playerApi } from "../../services/api";
import { Player } from "../../types";

const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await playerApi.getAll();
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError("플레이어 목록을 불러오는데 실패했습니다.");
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 플레이어를 삭제하시겠습니까?")) {
      try {
        await playerApi.delete(id);
        setPlayers(players.filter((player) => player.id !== id));
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

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>플레이어 목록</h2>
        <div className="d-flex gap-2">
          <Link to="/meetings/add" className="btn btn-outline-primary">
            <i className="bi bi-calendar-plus me-1"></i> 모임 추가
          </Link>
          <Link to="/players/add" className="btn btn-primary">
            <i className="bi bi-person-plus me-1"></i> 플레이어 추가
          </Link>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="alert alert-info">
          등록된 플레이어가 없습니다. 새 플레이어를 추가해보세요!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>이름</th>
                <th>출생년도</th>
                <th>MBTI</th>
                <th>지역</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td>
                    <Link
                      to={`/players/${player.id}`}
                      className="text-decoration-none"
                    >
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.birth_year}</td>
                  <td>{player.mbti}</td>
                  <td>{player.location}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/players/${player.id}`}
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        to={`/players/${player.id}/edit`}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(player.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
