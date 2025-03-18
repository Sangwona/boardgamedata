import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gameApi, gameResultApi } from "../../services/api";
import { GameWithStats, GameResultForm } from "../../types";

const GameResult: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GameResultForm[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    try {
      setLoading(true);
      await gameResultApi.create(parseInt(gameId), results);
      navigate("/games");
    } catch (err) {
      setError("게임 결과 저장에 실패했습니다.");
      console.error("Error saving game results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = () => {
    setResults([...results, { player_id: 0, score: 0, is_winner: false }]);
  };

  const handleRemoveResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleResultChange = (index: number, field: keyof GameResultForm, value: any) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [field]: value };
    setResults(newResults);
  };

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
          <h5 className="card-title">게임 결과</h5>
          <form onSubmit={handleSubmit}>
            {results.map((result, index) => (
              <div key={index} className="mb-3">
                <div className="row">
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="플레이어 ID"
                      value={result.player_id}
                      onChange={(e) =>
                        handleResultChange(index, "player_id", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="점수"
                      value={result.score}
                      onChange={(e) =>
                        handleResultChange(index, "score", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="col">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={result.is_winner}
                        onChange={(e) =>
                          handleResultChange(index, "is_winner", e.target.checked)
                        }
                      />
                      <label className="form-check-label">승리</label>
                    </div>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveResult(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mb-3"
              onClick={handleAddResult}
            >
              결과 추가
            </button>
            <button type="submit" className="btn btn-primary">
              저장
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameResult; 