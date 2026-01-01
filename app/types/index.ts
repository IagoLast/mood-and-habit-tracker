export interface Category {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreEntry {
  id: number;
  date: string;
  score: number;
}

export interface ListScoresResponse {
  user_id: string;
  entries: ScoreEntry[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}
