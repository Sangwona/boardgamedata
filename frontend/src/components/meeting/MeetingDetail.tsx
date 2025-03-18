import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { meetingApi } from "../../services/api";
import { MeetingDetail as MeetingDetailType } from "../../types";

const MeetingDetail: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingDetail = async () => {
      try {
        setLoading(true);
        const data = await meetingApi.getById(parseInt(meetingId!));
        setMeeting(data);
      } catch (err: any) {
        console.error("Error fetching meeting details:", err);
        const errorMessage =
          err.response?.data?.error ||
          `모임 정보를 불러오는데 실패했습니다. 오류: ${
            err.message || "알 수 없는 오류"
          }`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingDetail();
    }
  }, [meetingId]);

  const handleDelete = async () => {
    if (window.confirm("정말로 이 모임을 삭제하시겠습니까?")) {
      try {
        await meetingApi.delete(parseInt(meetingId!));
        navigate("/meetings");
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

  if (error || !meeting) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error || "모임 정보를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{meeting.date} 모임</h2>
        <div className="btn-group">
          <Link
            to={`/meetings/${meetingId}/edit`}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-pencil me-1"></i> 수정
          </Link>
          <Link
            to={`/meetings/${meetingId}/records/add`}
            className="btn btn-outline-success"
          >
            <i className="bi bi-plus-circle me-1"></i> 게임 기록 추가
          </Link>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> 삭제
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">모임 정보</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>날짜:</strong> {meeting.date}
              </p>
              <p>
                <strong>장소:</strong> {meeting.location}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>설명:</strong> {meeting.description || "설명 없음"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">참가자 목록</h5>
        </div>
        <div className="card-body">
          {meeting.participants.length === 0 ? (
            <div className="alert alert-info mb-0">참가자가 없습니다.</div>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-3">
              {meeting.participants.map((participant, index) => (
                <div key={index} className="col">
                  <div
                    className={`card h-100 ${
                      participant.registered ? "" : "border-warning"
                    }`}
                  >
                    <div className="card-body d-flex align-items-center">
                      <div>
                        <h6 className="mb-0">{participant.name}</h6>
                        {participant.registered ? (
                          <Link
                            to={`/players/${participant.id}`}
                            className="small text-decoration-none"
                          >
                            <i className="bi bi-person-badge me-1"></i>등록된
                            플레이어
                          </Link>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-person-dash me-1"></i>미등록
                            플레이어
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">게임 기록</h5>
        </div>
        <div className="card-body">
          {meeting.games.length === 0 ? (
            <div className="alert alert-info mb-0">게임 기록이 없습니다.</div>
          ) : (
            <div className="accordion" id="gamesAccordion">
              {meeting.games.map((game, index) => (
                <div className="accordion-item" key={game.id}>
                  <h2 className="accordion-header" id={`heading-${game.id}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${game.id}`}
                      aria-expanded="false"
                      aria-controls={`collapse-${game.id}`}
                    >
                      {game.name} - {game.results.length}명 참가
                    </button>
                  </h2>
                  <div
                    id={`collapse-${game.id}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading-${game.id}`}
                    data-bs-parent="#gamesAccordion"
                  >
                    <div className="accordion-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>플레이어</th>
                              <th>점수</th>
                              <th>결과</th>
                            </tr>
                          </thead>
                          <tbody>
                            {game.results.map((result) => (
                              <tr key={result.id}>
                                <td>
                                  {result.player.registered ? (
                                    <Link
                                      to={`/players/${result.player.id}`}
                                      className="text-decoration-none"
                                    >
                                      {result.player.name}
                                    </Link>
                                  ) : (
                                    <span>
                                      {result.player.name}{" "}
                                      <i className="bi bi-person-dash text-warning"></i>
                                    </span>
                                  )}
                                </td>
                                <td>{result.score}</td>
                                <td>
                                  {result.is_winner ? (
                                    <span className="badge bg-success">
                                      승리
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary">
                                      패배
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
