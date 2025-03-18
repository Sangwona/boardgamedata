import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { meetingApi, playerApi } from "../../services/api";
import { MeetingForm as MeetingFormType, Player } from "../../types";

const initialFormState: MeetingFormType = {
  date: "",
  location: "",
  description: "",
  host_id: 0,
};

const MeetingForm: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<MeetingFormType>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // 플레이어 목록 불러오기
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setPlayersLoading(true);
        const data = await playerApi.getAll();
        setPlayers(data);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("플레이어 목록을 불러오는데 실패했습니다.");
      } finally {
        setPlayersLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId) return;
      try {
        setLoading(true);
        const data = await meetingApi.getById(parseInt(meetingId));
        setForm({
          date: data.date,
          location: data.location,
          description: data.description || "",
          host_id: data.host_id,
        });
      } catch (err) {
        setError("모임 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // host_id가 문자열인 경우 숫자로 변환
    const formData = {
      ...form,
      host_id: typeof form.host_id === 'string' ? parseInt(form.host_id) : form.host_id
    };
    
    try {
      setLoading(true);
      if (meetingId) {
        await meetingApi.update(parseInt(meetingId), formData);
      } else {
        await meetingApi.create(formData);
      }
      navigate("/meetings");
    } catch (err) {
      setError("모임 저장에 실패했습니다.");
      console.error("Error saving meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // host_id는 숫자로 변환
    if (name === 'host_id') {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseInt(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading && !meetingId) return <div className="alert alert-info">로딩 중...</div>;

  return (
    <div className="container mt-4">
      <h2>{meetingId ? "모임 수정" : "새 모임"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">
            날짜
          </label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            장소
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
        <div className="mb-3">
          <label htmlFor="host_id" className="form-label">
            호스트
          </label>
          <select
            className="form-control"
            id="host_id"
            name="host_id"
            value={form.host_id || ""}
            onChange={handleChange}
            required
          >
            <option value="">호스트 선택</option>
            {playersLoading ? (
              <option disabled>플레이어 목록 로딩 중...</option>
            ) : (
              players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))
            )}
          </select>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || playersLoading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              처리중...
            </>
          ) : (
            meetingId ? "수정" : "생성"
          )}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary ms-2" 
          onClick={() => navigate('/meetings')}
        >
          취소
        </button>
      </form>
    </div>
  );
};

export default MeetingForm;
