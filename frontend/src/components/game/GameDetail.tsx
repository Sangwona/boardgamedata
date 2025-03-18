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
    const fetchGame = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const data = await gameApi.getById(parseInt(gameId));
        setGame(data);
      } catch (err) {
        setError("게임 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching game:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!game) return <div>게임을 찾을 수 없습니다.</div>;

  return (
    <div className="container mt-4">
      <h2>{game.name}</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">게임 정보</h5>
          <p className="card-text">{game.description}</p>
          <h5 className="card-title">통계</h5>
          <ul className="list-unstyled">
            <li>총 플레이 횟수: {game.total_plays}</li>
            <li>총 플레이어 수: {game.total_players}</li>
            <li>승률: {game.win_rate}%</li>
            <li>평균 점수: {game.average_score}</li>
          </ul>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/games/${game.id}/edit`)}
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
