import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { playerApi } from "../../services/api";
import { PlayerForm as PlayerFormType } from "../../types";

const initialFormState: PlayerFormType = {
  name: "",
  birth_year: null,
  mbti: "",
  location: "",
};

const PlayerForm: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<PlayerFormType>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) return;
      try {
        setLoading(true);
        const data = await playerApi.getById(parseInt(playerId));
        setForm({
          name: data.name,
          birth_year: data.birth_year,
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
  }, [playerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (playerId) {
        await playerApi.update(parseInt(playerId), form);
      } else {
        await playerApi.create(form);
      }
      navigate("/players");
    } catch (err) {
      setError("플레이어 저장에 실패했습니다.");
      console.error("Error saving player:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "birth_year") {
      const year = parseInt(value);
      if (value === "" || (year >= 0 && year <= 99)) {
        setForm((prev) => ({
          ...prev,
          [name]: value === "" ? null : year,
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container mt-4">
      <h2>{playerId ? "플레이어 수정" : "새 플레이어"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
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
            출생년도 (YY)
          </label>
          <input
            type="number"
            className="form-control"
            id="birth_year"
            name="birth_year"
            value={form.birth_year || ""}
            onChange={handleChange}
            min="0"
            max="99"
            placeholder="예: 90"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mbti" className="form-label">
            MBTI
          </label>
          <select
            className="form-control"
            id="mbti"
            name="mbti"
            value={form.mbti}
            onChange={handleChange}
            required
          >
            <option value="">MBTI 유형 선택</option>
            <option value="ISTJ">ISTJ</option>
            <option value="ISFJ">ISFJ</option>
            <option value="INFJ">INFJ</option>
            <option value="INTJ">INTJ</option>
            <option value="ISTP">ISTP</option>
            <option value="ISFP">ISFP</option>
            <option value="INFP">INFP</option>
            <option value="INTP">INTP</option>
            <option value="ESTP">ESTP</option>
            <option value="ESFP">ESFP</option>
            <option value="ENFP">ENFP</option>
            <option value="ENTP">ENTP</option>
            <option value="ESTJ">ESTJ</option>
            <option value="ESFJ">ESFJ</option>
            <option value="ENFJ">ENFJ</option>
            <option value="ENTJ">ENTJ</option>
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
        <button type="submit" className="btn btn-primary">
          {playerId ? "수정" : "생성"}
        </button>
      </form>
    </div>
  );
};

export default PlayerForm;
