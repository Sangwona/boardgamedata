import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { meetingApi } from "../../services/api";
import { MeetingForm as MeetingFormType } from "../../types";

const initialFormState: MeetingFormType = {
  date: "",
  location: "",
  description: "",
};

const MeetingForm: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!meetingId;

  const [form, setForm] = useState<MeetingFormType>(initialFormState);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const data = await meetingApi.getById(parseInt(meetingId));
        setForm({
          date: data.date,
          location: data.location,
          description: data.description,
        });
      } catch (err) {
        setError("모임 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.date || !form.location) {
      setError("날짜와 장소는 필수 입력 항목입니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        await meetingApi.update(parseInt(meetingId), form);
        navigate(`/meetings/${meetingId}`);
      } else {
        const newMeeting = await meetingApi.create(form);
        navigate(`/meetings/${newMeeting.id}`);
      }
    } catch (err) {
      setError("모임 저장에 실패했습니다.");
      console.error("Error saving meeting:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
      <h2>{isEditMode ? "모임 수정" : "새 모임 추가"}</h2>

      {error && (
        <div className="alert alert-danger my-3" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
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
            min="2020-01-01"
            max="2030-12-31"
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
            placeholder="모임 장소 (예: 스타벅스 강남점)"
            required
          />
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
            placeholder="모임에 대한 추가 설명"
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
            onClick={() =>
              navigate(isEditMode ? `/meetings/${meetingId}` : "/meetings")
            }
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
