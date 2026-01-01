import { client } from '@/client/api-client';
import type { DailyScore } from '@/types';

export const scoresRepository = {
  list: async (args: {
    startDate?: string;
    endDate?: string;
  }): Promise<DailyScore[]> => {
    const params: Record<string, string> = {};
    if (args.startDate) params.startDate = args.startDate;
    if (args.endDate) params.endDate = args.endDate;
    const response = await client.get('/api/scores', { params });
    return response.data.data;
  },

  getByDate: async (args: { dateZts: string }): Promise<DailyScore> => {
    const response = await client.get(`/api/scores/${encodeURIComponent(args.dateZts)}`);
    return response.data;
  },

  create: async (args: {
    dateZts: string;
    score: number;
  }): Promise<DailyScore> => {
    const response = await client.post('/api/scores', {
      dateZts: args.dateZts,
      score: args.score,
    });
    return response.data;
  },

  delete: async (args: { dateZts: string }): Promise<void> => {
    await client.delete(`/api/scores/${encodeURIComponent(args.dateZts)}`);
  },
};
