import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi, playerApi, gameRecordApi } from "../../services/api";
import { Game, Player, GameResultForm, StandaloneGameRecordForm as StandaloneGameRecordFormType } from "../../types";

interface StandaloneGameRecordFormState {
  gameId: number;
  date: string;
  players: {
    id: number;
    name: string;
    isChecked: boolean;
    score: number;
    isWinner: boolean;
  }[];
  unregisteredPlayers: {
    id: string;
    name: string;
    score: number;
    isWinner: boolean;
  }[];
  newGame: {
    name: string;
    description: string;
  };
  showNewGameForm: boolean;
}

const StandaloneGameRecordForm: React.FC = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formState, setFormState] = useState<StandaloneGameRecordFormState>({
    gameId: 0,
    date: new Date().toISOString().split("T")[0], // 오늘 날짜
    players: [],
    unregisteredPlayers: [],
    newGame: {
      name: "",
      description: "",
    },
    showNewGameForm: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamesData, playersData] = await Promise.all([
          gameApi.getAll(),
          playerApi.getAll(),
        ]);

        setGames(gamesData);

        // 플레이어 초기 상태 설정
        const initialPlayers = playersData.map((player) => ({
          id: player.id,
          name: player.name,
          isChecked: false,
          score: 0,
          isWinner: false,
        }));

        setPlayers(playersData);
        setFormState((prev) => ({
          ...prev,
          players: initialPlayers,
        }));
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gameId = parseInt(e.target.value);
    setFormState((prev) => ({
      ...prev,
      gameId: gameId,
      showNewGameForm: gameId === 0,
    }));
  };

  const handleNewGameInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      newGame: {
        ...prev.newGame,
        [name.replace("new_game_", "")]: value,
      },
    }));
  };

  const handlePlayerCheckChange = (playerId: number, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, isChecked: checked } : player
      ),
    }));
  };

  const handlePlayerScoreChange = (playerId: number, score: number) => {
    setFormState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, score } : player
      ),
    }));
  };

  const handlePlayerWinnerChange = (playerId: number, isWinner: boolean) => {
    setFormState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, isWinner } : player
      ),
    }));
  };

  const addUnregisteredPlayer = () => {
    const newId = `unregistered_${Date.now()}`;
    setFormState((prev) => ({
      ...prev,
      unregisteredPlayers: [
        ...prev.unregisteredPlayers,
        { id: newId, name: "", score: 0, isWinner: false },
      ],
    }));
  };

  const removeUnregisteredPlayer = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      unregisteredPlayers: prev.unregisteredPlayers.filter(
        (player) => player.id !== id
      ),
    }));
  };

  const handleUnregisteredPlayerChange = (
    id: string,
    field: "name" | "score" | "isWinner",
    value: string | number | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      unregisteredPlayers: prev.unregisteredPlayers.map((player) =>
        player.id === id ? { ...player, [field]: value } : player
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // 날짜 확인
      if (!formState.date) {
        setError("날짜를 입력해주세요.");
        setSubmitting(false);
        return;
      }

      // 선택된 게임 ID 확인
      let finalGameId = formState.gameId;

      // 새 게임을 생성해야 하는 경우
      if (formState.showNewGameForm) {
        if (!formState.newGame.name) {
          setError("게임 이름을 입력해주세요.");
          setSubmitting(false);
          return;
        }

        // 새 게임 생성
        const newGame = await gameApi.create({
          name: formState.newGame.name,
          description: formState.newGame.description,
        });

        finalGameId = newGame.id;
      }

      if (finalGameId === 0) {
        setError("게임을 선택하거나 새 게임을 추가해주세요.");
        setSubmitting(false);
        return;
      }

      // 참가자 확인 (등록된 플레이어)
      const selectedPlayers = formState.players.filter((p) => p.isChecked);

      // 미등록 플레이어
      const validUnregisteredPlayers = formState.unregisteredPlayers.filter(
        (p) => p.name.trim() !== ""
      );

      if (
        selectedPlayers.length === 0 &&
        validUnregisteredPlayers.length === 0
      ) {
        setError("최소 한 명 이상의 플레이어를 선택하거나 추가해주세요.");
        setSubmitting(false);
        return;
      }

      // API 요청용 결과 데이터 구성
      const gameRecordData: StandaloneGameRecordFormType = {
        game_id: finalGameId,
        date: formState.date,
        results: [
          // 등록된 플레이어
          ...selectedPlayers.map((player) => ({
            player_id: player.id,
            score: player.score,
            is_winner: player.isWinner,
          })),
          // 미등록 플레이어 - 임시로 player_id를 0으로 설정
          ...validUnregisteredPlayers.map((player) => ({
            player_id: 0, // 백엔드에서 이 값은 무시되고 player_name 사용
            player_name: player.name.trim(),
            score: player.score,
            is_winner: player.isWinner,
          })) as any,
        ],
      };

      // 게임 결과 추가
      await gameRecordApi.create(0, gameRecordData); // 모임 ID가 없으므로 0 전달

      // 성공 메시지 설정 및 폼 초기화
      setSuccess("게임 기록이 성공적으로 추가되었습니다.");
      
      // 폼 초기화 (선택된 게임과 날짜는 유지)
      setFormState((prev) => ({
        ...prev,
        players: prev.players.map(p => ({...p, isChecked: false, score: 0, isWinner: false})),
        unregisteredPlayers: [],
      }));
      
      // 3초 후에 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("게임 기록 저장에 실패했습니다.");
      console.error("Error saving game record:", err);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="container mt-4">
      <h2>독립형 게임 기록 추가</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">게임 정보</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="date" className="form-label">날짜</label>
              <input
                type="date"
                className="form-control"
                id="date"
                value={formState.date}
                onChange={handleDateChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="game_id" className="form-label">게임 선택</label>
              <select
                id="game_id"
                className="form-select"
                value={formState.gameId}
                onChange={handleGameChange}
              >
                <option value={0}>-- 새 게임 입력 --</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            
            {formState.showNewGameForm && (
              <div className="card mb-3">
                <div className="card-header">
                  <h6 className="mb-0">새 게임 정보</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="new_game_name" className="form-label">
                      게임 이름
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="new_game_name"
                      name="new_game_name"
                      value={formState.newGame.name}
                      onChange={handleNewGameInputChange}
                      required={formState.showNewGameForm}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new_game_description" className="form-label">
                      설명 (선택사항)
                    </label>
                    <textarea
                      className="form-control"
                      id="new_game_description"
                      name="new_game_description"
                      rows={3}
                      value={formState.newGame.description}
                      onChange={handleNewGameInputChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">참가자 및 결과</h5>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h6 className="mb-3">등록된 플레이어</h6>
              <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}></th>
                      <th>이름</th>
                      <th style={{ width: "150px" }}>점수</th>
                      <th style={{ width: "120px" }}>승리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formState.players.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`player_${player.id}`}
                              checked={player.isChecked}
                              onChange={(e) =>
                                handlePlayerCheckChange(
                                  player.id,
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`player_${player.id}`}
                            ></label>
                          </div>
                        </td>
                        <td>
                          <label
                            htmlFor={`player_${player.id}`}
                            className="form-check-label"
                          >
                            {player.name}
                          </label>
                        </td>
                        <td>
                          {player.isChecked && (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={player.score}
                              min={0}
                              onChange={(e) =>
                                handlePlayerScoreChange(
                                  player.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          )}
                        </td>
                        <td>
                          {player.isChecked && (
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`winner_${player.id}`}
                                checked={player.isWinner}
                                onChange={(e) =>
                                  handlePlayerWinnerChange(
                                    player.id,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`winner_${player.id}`}
                              >
                                승리
                              </label>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">미등록 플레이어</h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addUnregisteredPlayer}
                >
                  <i className="bi bi-plus-circle me-1"></i> 추가
                </button>
              </div>

              {formState.unregisteredPlayers.length === 0 ? (
                <div className="text-muted small fst-italic">
                  플레이어 목록에 없는 참가자가 있으면 여기에 추가하세요.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>이름</th>
                        <th style={{ width: "150px" }}>점수</th>
                        <th style={{ width: "120px" }}>승리</th>
                        <th style={{ width: "80px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formState.unregisteredPlayers.map((player) => (
                        <tr key={player.id}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="이름 입력"
                              value={player.name}
                              onChange={(e) =>
                                handleUnregisteredPlayerChange(
                                  player.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min={0}
                              value={player.score}
                              onChange={(e) =>
                                handleUnregisteredPlayerChange(
                                  player.id,
                                  "score",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`winner_${player.id}`}
                                checked={player.isWinner}
                                onChange={(e) =>
                                  handleUnregisteredPlayerChange(
                                    player.id,
                                    "isWinner",
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`winner_${player.id}`}
                              >
                                승리
                              </label>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                removeUnregisteredPlayer(player.id)
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>
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

        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/games")}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StandaloneGameRecordForm;
