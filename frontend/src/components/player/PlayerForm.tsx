import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playerApi } from "../../services/api";
import { PlayerForm as PlayerFormType } from "../../types";

const mbtiOptions = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

const initialFormState: PlayerFormType = {
  name: "",
  birth_year: 0,
  mbti: "",
  location: "",
};

const PlayerForm: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!playerId;

  const [form, setForm] = useState<PlayerFormType>(initialFormState);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const data = await playerApi.getById(parseInt(playerId));
        // 출생년도를 2자리로 변환 (4자리 -> 2자리)
        setForm({
          name: data.name,
          birth_year: data.birth_year % 100,
          mbti: data.mbti,
          location: data.location,
        });
      } catch (err) {
        setError("플레이어 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching player:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "birth_year" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.name ||
      form.birth_year === null ||
      !form.mbti ||
      !form.location
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        await playerApi.update(parseInt(playerId), form);
        navigate(`/players/${playerId}`);
      } else {
        const newPlayer = await playerApi.create(form);
        navigate(`/players/${newPlayer.id}`);
      }
    } catch (err) {
      setError("플레이어 저장에 실패했습니다.");
      console.error("Error saving player:", err);
    } finally {
      setIsSubmitting(false);
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
    <div>
      <h2>{isEditMode ? "플레이어 수정" : "새 플레이어 추가"}</h2>

      {error && (
        <div className="alert alert-danger my-3" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            이름
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
          <label htmlFor="birth_year" className="form-label">
            출생년도 (마지막 2자리)
          </label>
          <input
            type="number"
            className="form-control"
            id="birth_year"
            name="birth_year"
            min="0"
            max="99"
            placeholder="예: 90"
            value={form.birth_year || ""}
            onChange={handleChange}
            required
          />
          <div className="form-text">
            출생년도 마지막 2자리를 입력하세요 (예: 1990년생은 90)
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="mbti" className="form-label">
            MBTI
          </label>
          <select
            className="form-select"
            id="mbti"
            name="mbti"
            value={form.mbti}
            onChange={handleChange}
            required
          >
            <option value="">MBTI 유형 선택</option>
            {mbtiOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            지역
          </label>
          <input
            type="text"
            className="form-control"
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
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
            onClick={() =>
              navigate(isEditMode ? `/players/${playerId}` : "/players")
            }
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerForm;
