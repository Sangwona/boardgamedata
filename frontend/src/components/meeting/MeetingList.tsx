import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { meetingApi } from "../../services/api";
import { Meeting } from "../../types";

const MeetingList: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await meetingApi.getAll();
        setMeetings(data);
        setError(null);
      } catch (err) {
        setError("모임 목록을 불러오는데 실패했습니다.");
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 모임을 삭제하시겠습니까?")) {
      try {
        await meetingApi.delete(id);
        setMeetings(meetings.filter((meeting) => meeting.id !== id));
      } catch (err) {
        setError("모임 삭제에 실패했습니다.");
        console.error("Error deleting meeting:", err);
      }
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

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>모임 목록</h2>
        <div className="d-flex gap-2">
          <Link to="/players/add" className="btn btn-outline-primary">
            <i className="bi bi-person-plus me-1"></i> 플레이어 추가
          </Link>
          <Link to="/meetings/add" className="btn btn-primary">
            <i className="bi bi-plus-circle me-1"></i> 모임 추가
          </Link>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="alert alert-info">
          등록된 모임이 없습니다. 새 모임을 추가해보세요!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>날짜</th>
                <th>장소</th>
                <th>설명</th>
                <th>참가자</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>
                    <Link
                      to={`/meetings/${meeting.id}`}
                      className="text-decoration-none"
                    >
                      {meeting.date}
                    </Link>
                  </td>
                  <td>{meeting.location}</td>
                  <td>
                    {meeting.description || (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary rounded-pill">
                      {meeting.participant_count}명
                      {meeting.unregistered_count > 0 &&
                        ` (미등록: ${meeting.unregistered_count}명)`}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/meetings/${meeting.id}`}
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        to={`/meetings/${meeting.id}/records/add`}
                        className="btn btn-outline-success"
                      >
                        <i className="bi bi-controller"></i>
                      </Link>
                      <Link
                        to={`/meetings/${meeting.id}/edit`}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(meeting.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MeetingList;
