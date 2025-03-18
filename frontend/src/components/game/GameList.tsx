import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gameApi } from "../../services/api";
import { Game } from "../../types";

const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getAll();
        setGames(data);
        setError(null);
      } catch (err) {
        setError("게임 목록을 불러오는데 실패했습니다.");
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>게임 목록</h2>
        <div className="d-flex gap-2">
          <Link to="/players/add" className="btn btn-outline-primary">
            <i className="bi bi-person-plus me-1"></i> 플레이어 추가
          </Link>
          <Link to="/meetings/add" className="btn btn-outline-primary">
            <i className="bi bi-calendar-plus me-1"></i> 모임 추가
          </Link>
          <Link to="/games/add" className="btn btn-primary">
            <i className="bi bi-plus-circle me-1"></i> 게임 추가
          </Link>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="alert alert-info">
          등록된 게임이 없습니다. 새 게임을 추가해보세요!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>이름</th>
                <th>인원</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="fw-bold">
                    <Link
                      to={`/games/${game.id}`}
                      className="text-decoration-none"
                    >
                      {game.name}
                    </Link>
                  </td>
                  <td>
                    {game.min_players}~{game.max_players}명
                  </td>
                  <td>
                    {game.description || <span className="text-muted">-</span>}
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

export default GameList;
