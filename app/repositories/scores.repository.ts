import { client } from '@/client/api-client';
import type { ScoreEntry, ListScoresResponse } from '@/types';

export const scoresRepository = {
  list: async (args: {
    startDate?: string;
    endDate?: string;
  }): Promise<ScoreEntry[]> => {
    const params: Record<string, string> = {};
    if (args.startDate) params.startDate = args.startDate;
    if (args.endDate) params.endDate = args.endDate;
    const response = await client.get<ListScoresResponse>('/api/scores', { params });
    return response.data.entries;
  },
};
