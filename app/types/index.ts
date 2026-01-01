export interface Category {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
}

export interface Element {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
}

export interface DailyScore {
  id: number;
  user_id: string;
  date_zts: string;
  score: number;
  created_at: string;
  updated_at: string;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
