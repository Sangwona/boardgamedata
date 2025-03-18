import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../../services/api";
import { GameForm as GameFormType } from "../../types";

const initialFormState: GameFormType = {
  name: "",
  min_players: 2,
  max_players: 8,
  description: "",
};

const GameForm: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<GameFormType>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("players") ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name) {
      setError("게임 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await gameApi.create(form);
      navigate("/games");
    } catch (err) {
      setError("게임 저장에 실패했습니다.");
      console.error("Error saving game:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>새 게임 추가</h2>

      {error && (
        <div className="alert alert-danger my-3" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
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

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="min_players" className="form-label">
              최소 인원
            </label>
            <input
              type="number"
              className="form-control"
              id="min_players"
              name="min_players"
              min="1"
              value={form.min_players}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="max_players" className="form-label">
              최대 인원
            </label>
            <input
              type="number"
              className="form-control"
              id="max_players"
              name="max_players"
              min={form.min_players}
              value={form.max_players}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            설명 (선택사항)
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/games")}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;
