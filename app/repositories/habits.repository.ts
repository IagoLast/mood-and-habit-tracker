import { client } from '@/client/api-client';
import type { Category, Habit } from '@/types';

export interface HabitCategory extends Category {
  elements: Habit[];
}

export interface HabitsResponse {
  categories: HabitCategory[];
}

export interface UpsertElement {
  id?: number;
  name: string;
  iconName?: string | null;
}

export interface UpsertCategory {
  id?: number;
  name: string;
  elements: UpsertElement[];
}

export interface UpsertHabitsRequest {
  categories: UpsertCategory[];
}

export const habitsRepository = {
  get: async (): Promise<HabitsResponse> => {
    const response = await client.get('/api/habits');
    return response.data;
  },

  upsert: async (args: UpsertHabitsRequest): Promise<HabitsResponse> => {
    const response = await client.put('/api/habits', args);
    return response.data;
  },
};
