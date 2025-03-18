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
} from "../types";

// 포트 변경: 5000 -> 5005
const API_URL = "http://localhost:5005/api";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: false,
  timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    // config.headers에 대한 유효성 검사만 유지하고, 불필요한 CORS 헤더는 제거
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 에러 핸들링 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 요청 에러:", error.response || error);
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
    const { data } = await api.get(`/meetings/${id}`);
    return data;
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
};

// 게임 API
export const gameApi = {
  getAll: async (): Promise<Game[]> => {
    const { data } = await api.get("/games");
    return data;
  },

  getById: async (id: number): Promise<GameWithStats> => {
    const { data } = await api.get(`/games/${id}`);
    return data;
  },

  create: async (game: GameForm): Promise<Game> => {
    const { data } = await api.post("/games", game);
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

export default api;
