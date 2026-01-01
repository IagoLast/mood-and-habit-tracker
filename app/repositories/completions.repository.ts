import { client } from '@/client/api-client';
import type { DailyCompletion } from '@/types';

export const completionsRepository = {
  list: async (args: { elementId: number; dateZts?: string }): Promise<DailyCompletion[]> => {
    const params = args.dateZts
      ? { elementId: args.elementId, date: args.dateZts }
      : { elementId: args.elementId };
    const response = await client.get('/api/completions', { params });
    return response.data.data;
  },

  create: async (args: {
    elementId: number;
    dateZts: string;
  }): Promise<DailyCompletion> => {
    const response = await client.post('/api/completions', {
      elementId: args.elementId,
      dateZts: args.dateZts,
    });
    return response.data;
  },

  delete: async (args: { elementId: number; dateZts: string }): Promise<void> => {
    await client.delete('/api/completions', {
      params: { elementId: args.elementId, date: args.dateZts },
    });
  },
};
