// Player 관련 타입
export interface Player {
  id: number;
  name: string;
  birth_year: number | null;
  mbti: string;
  location: string;
  nickname?: string;
  comment?: string;
  game_history?: GameResult[];
}

export interface PlayerForm {
  name: string;
  birth_year: number | null;
  mbti: string;
  location: string;
}

// 미팅 관련 타입
export interface Meeting {
  id: number;
  date: string;
  location: string;
  description: string | null;
  host_id: number;
  created_at: string;
  host: Player;
  game_count: number;
  participant_count: number;
  unregistered_count: number;
  planned_games: Game[];
}

export interface MeetingDetail extends Meeting {
  participants: {
    id: number;
    name: string;
    arrival_time: string;
    status: "confirmed" | "maybe" | "declined";
    registered: boolean;
  }[];
  game_records: GameRecord[];
}

export interface MeetingForm {
  date: string;
  location: string;
  description: string;
  host_id: number;
}

export interface MeetingParticipantForm {
  player_id: number;
  arrival_time: string;
  status?: "confirmed" | "maybe" | "declined";
}

// 게임 관련 타입
export interface Game {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface PlayerStat {
  player_id: number;
  player_name: string;
  wins: number;
  plays: number;
  win_rate: number;
}

export interface GameWithStats extends Game {
  total_plays: number;
  total_players: number;
  win_rate: number;
  average_score: number;
}

export interface GameForm {
  name: string;
  description: string;
}

// 게임 결과 관련 타입
export interface GameResult {
  id: number;
  game_record_id: number;
  player_id: number | null;
  player_name: string;
  score: number;
  is_winner: boolean;
  player: {
    id: number | null;
    name: string;
    registered: boolean;
  };
}

export interface GameResultForm {
  player_id: number;
  score: number;
  is_winner: boolean;
}

// 독립형 게임 기록 관련 타입
export interface StandaloneGameRecordForm {
  game_id: number;
  date: string;
  results: GameResultForm[];
}

export interface GameRecord {
  id: number;
  game_id: number;
  meeting_id: number | null;
  date: string;
  game: Game;
  results: GameResult[];
}

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
