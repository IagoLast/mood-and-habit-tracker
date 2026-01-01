import { client } from '@/client/api-client';

export interface DayElement {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
  completed: boolean;
}

export interface DayCategory {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
  elements: DayElement[];
}

export interface DayData {
  date_zts: string;
  score: number | null;
  categories: DayCategory[];
}

export interface UpdateDayRequest {
  date_zts?: string;
  score?: number | null;
  elements: Array<{
    elementId: number;
    completed: 'COMPLETED' | 'NOT_COMPLETED';
  }>;
}

export const daysRepository = {
  getByDate: async (args: { date: string }): Promise<DayData> => {
    const response = await client.get(`/api/days/${args.date}`);
    return response.data;
  },

  update: async (args: { date: string; data: UpdateDayRequest }): Promise<DayData> => {
    const response = await client.put(`/api/days/${args.date}`, args.data);
    return response.data;
  },
};
