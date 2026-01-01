import { client } from '@/client/api-client';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser(): User | null {
    const json = localStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  async loginWithGoogleToken(googleToken: string): Promise<{ token: string; user: User }> {
    const response = await client.post('/api/auth/google', { googleToken });
    const { token, user } = response.data;
    
    this.setToken(token);
    this.setUser(user);
    
    return { token, user };
  },
};
