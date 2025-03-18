import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gameApi } from "../../services/api";
import { Game } from "../../types";

const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getAll();
        setGames(data);
      } catch (err) {
        setError("게임 목록을 불러오는데 실패했습니다.");
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>게임 목록</h2>
      <div className="row">
        {games.map((game) => (
          <div key={game.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{game.name}</h5>
                <p className="card-text">{game.description}</p>
                <Link to={`/games/${game.id}`} className="btn btn-primary">
                  상세 보기
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/games/new" className="btn btn-success">
        새 게임 추가
      </Link>
    </div>
  );
};

export default GameList;
