// Player 관련 타입
export interface Player {
  id: number;
  name: string;
  birth_year: number;
  mbti: string;
  location: string;
  nickname?: string;
  comment?: string;
  game_history?: GameResult[];
}

export interface PlayerForm {
  name: string;
  birth_year: number;
  mbti: string;
  location: string;
}

// 미팅 관련 타입
export interface Meeting {
  id: number;
  date: string;
  location: string;
  description: string;
  participants_count: number;
  unregistered_count: number;
}

export interface MeetingDetail
  extends Omit<Meeting, "participants_count" | "unregistered_count"> {
  participants: Participant[];
  games: GameWithResults[];
}

export interface Participant {
  id: number | null;
  name: string;
  registered: boolean;
}

export interface GameWithResults {
  id: number;
  name: string;
  results: GameResultDetail[];
}

export interface GameResultDetail {
  id: number;
  player: Participant;
  score: number;
  is_winner: boolean;
}

export interface MeetingForm {
  date: string;
  location: string;
  description: string;
}

// 게임 관련 타입
export interface Game {
  id: number;
  name: string;
  min_players: number;
  max_players: number;
  description: string;
}

export interface PlayerStat {
  player_id: number;
  player_name: string;
  wins: number;
  plays: number;
  win_rate: number;
}

export interface GameWithStats extends Game {
  play_count: number;
  stats: {
    players: PlayerStat[];
  };
}

export interface GameForm {
  name: string;
  min_players: number;
  max_players: number;
  description: string;
}

// 게임 결과 관련 타입
export interface GameResult {
  id: number;
  game_id: number;
  game_name?: string;
  player_id: number | null;
  player_name?: string;
  meeting_id: number;
  meeting_date?: string;
  meeting_location?: string;
  score: number;
  is_winner: boolean;
}

export interface GameResultForm {
  game_id: number;
  player_id?: number;
  player_name?: string;
  score: number;
  is_winner: boolean;
}

// 독립형 게임 기록 관련 타입
export interface StandaloneGameRecordForm {
  game_id: number;
  date: string;
  results: GameResultForm[];
}

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
