import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gameApi } from "../../services/api";
import { GameForm as GameFormType } from "../../types";

const initialFormState: GameFormType = {
  name: "",
  description: "",
};

const GameForm: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<GameFormType>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) return;
      try {
        setLoading(true);
        const data = await gameApi.getById(parseInt(gameId));
        setForm({
          name: data.name,
          description: data.description,
        });
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
    try {
      setLoading(true);
      if (gameId) {
        await gameApi.update(parseInt(gameId), form);
      } else {
        await gameApi.create(form);
      }
      navigate("/games");
    } catch (err) {
      setError("게임 저장에 실패했습니다.");
      console.error("Error saving game:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container mt-4">
      <h2>{gameId ? "게임 수정" : "새 게임"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            게임 이름
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            설명
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {gameId ? "수정" : "생성"}
        </button>
      </form>
    </div>
  );
};

export default GameForm;
