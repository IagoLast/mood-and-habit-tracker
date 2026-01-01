import { client } from '@/client/api-client';
import type { Category } from '@/types';

export const categoriesRepository = {
  list: async (): Promise<Category[]> => {
    const response = await client.get('/api/categories');
    return response.data.data;
  },

  getById: async (args: { id: number }): Promise<Category> => {
    const response = await client.get(`/api/categories/${args.id}`);
    return response.data;
  },

  create: async (args: { name: string }): Promise<Category> => {
    const response = await client.post('/api/categories', { name: args.name });
    return response.data;
  },

  update: async (args: { id: number; name: string }): Promise<Category> => {
    const response = await client.put(`/api/categories/${args.id}`, { name: args.name });
    return response.data;
  },

  delete: async (args: { id: number }): Promise<void> => {
    await client.delete(`/api/categories/${args.id}`);
  },
};
