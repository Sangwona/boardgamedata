import axios from "axios";
import {
  Player,
  PlayerForm,
  Meeting,
  MeetingForm,
  Game,
  GameForm,
  GameResult,
  GameResultForm,
  MeetingDetail,
  GameWithStats,
  MeetingParticipantForm,
  StandaloneGameRecordForm,
} from "../types";

// 포트 변경: 5000 -> 5005
const API_URL = "http://localhost:5005/api";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 5000, // 5초 타임아웃
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API 요청 에러:", error);
    return Promise.reject(error);
  }
);

// 에러 핸들링 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API 응답 에러:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// 플레이어 API
export const playerApi = {
  getAll: async (): Promise<Player[]> => {
    const { data } = await api.get("/players");
    return data;
  },

  getById: async (id: number): Promise<Player> => {
    const { data } = await api.get(`/players/${id}`);
    return data;
  },

  create: async (player: PlayerForm): Promise<Player> => {
    const { data } = await api.post("/players", player);
    return data;
  },

  update: async (id: number, player: PlayerForm): Promise<Player> => {
    const { data } = await api.put(`/players/${id}`, player);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/players/${id}`);
  },
};

// 미팅 API
export const meetingApi = {
  getAll: async (): Promise<Meeting[]> => {
    const { data } = await api.get("/meetings");
    return data;
  },

  getById: async (id: number): Promise<MeetingDetail> => {
    try {
      console.log(`미팅 상세 정보 요청: /meetings/${id}`);
      const { data } = await api.get(`/meetings/${id}`);
      console.log(`미팅 상세 정보 응답:`, data);
      return data;
    } catch (error) {
      console.error(`미팅 상세 정보 조회 오류(ID: ${id}):`, error);
      throw error;
    }
  },

  create: async (meeting: MeetingForm): Promise<Meeting> => {
    const { data } = await api.post("/meetings", meeting);
    return data;
  },

  update: async (id: number, meeting: MeetingForm): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${id}`, meeting);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  addParticipant: async (meetingId: number, participant: MeetingParticipantForm): Promise<any> => {
    const { data } = await api.post(`/meetings/${meetingId}/participants`, participant);
    return data;
  }
};

// 게임 API
export const gameApi = {
  getAll: async (): Promise<Game[]> => {
    const { data } = await api.get("/games");
    return data;
  },

  getById: async (id: number): Promise<GameWithStats> => {
    try {
      console.log(`게임 상세 정보 요청: /games/${id}`);
      const { data } = await api.get(`/games/${id}`);
      console.log(`게임 상세 정보 응답:`, data);
      return data;
    } catch (error) {
      console.error(`게임 상세 정보 조회 오류(ID: ${id}):`, error);
      throw error;
    }
  },

  create: async (game: GameForm): Promise<Game> => {
    const { data } = await api.post("/games", game);
    return data;
  },

  update: async (id: number, game: GameForm): Promise<Game> => {
    const { data } = await api.put(`/games/${id}`, game);
    return data;
  },
};

// 게임 결과 API
export const gameResultApi = {
  create: async (
    meetingId: number,
    results: GameResultForm[]
  ): Promise<GameResult[]> => {
    const { data } = await api.post(`/meetings/${meetingId}/records`, {
      results,
    });
    return data;
  },

  createStandalone: async (
    gameId: number,
    date: string,
    results: GameResultForm[]
  ): Promise<any> => {
    const { data } = await api.post(`/game-records`, {
      game_id: gameId,
      date: date,
      results: results,
    });
    return data;
  },

  getUnregisteredByName: async (name: string): Promise<GameResult[]> => {
    const { data } = await api.get("/unregistered_records", {
      params: { name },
    });
    return data;
  },

  linkToPlayer: async (
    playerId: number,
    recordIds: number[]
  ): Promise<void> => {
    await api.post(`/players/${playerId}/claim_records`, {
      record_ids: recordIds,
    });
  },
};

// 통계 API
export const statsApi = {
  getStats: async () => {
    const response = await api.get("/stats");
    return response.data;
  },

  getPlayerStats: async (playerId: number) => {
    const response = await api.get(`/stats/player/${playerId}`);
    return response.data;
  },
};

// 게임 기록 API
export const gameRecordApi = {
  create: async (
    meetingId: number,
    recordData: StandaloneGameRecordForm
  ): Promise<any> => {
    const { data } = await api.post(`/meetings/${meetingId}/records`, recordData);
    return data;
  },

  getByMeetingId: async (meetingId: number): Promise<any> => {
    const { data } = await api.get(`/meetings/${meetingId}/records`);
    return data;
  },

  getById: async (recordId: number): Promise<any> => {
    const { data } = await api.get(`/game-records/${recordId}`);
    return data;
  },
};

export default api;
