import { client } from '@/client/api-client';
import type { Element } from '@/types';

export const elementsRepository = {
  list: async (args: { categoryId: number }): Promise<Element[]> => {
    const response = await client.get('/api/elements', { params: { categoryId: args.categoryId } });
    return response.data.data;
  },

  getById: async (args: { id: number }): Promise<Element> => {
    const response = await client.get(`/api/elements/${args.id}`);
    return response.data;
  },

  create: async (args: { name: string; categoryId: number; iconName?: string | null }): Promise<Element> => {
    const response = await client.post('/api/elements', {
      name: args.name,
      categoryId: args.categoryId,
      iconName: args.iconName,
    });
    return response.data;
  },

  update: async (args: { id: number; name: string; iconName?: string | null }): Promise<Element> => {
    const response = await client.put(`/api/elements/${args.id}`, {
      name: args.name,
      iconName: args.iconName,
    });
    return response.data;
  },

  delete: async (args: { id: number }): Promise<void> => {
    await client.delete(`/api/elements/${args.id}`);
  },
};
