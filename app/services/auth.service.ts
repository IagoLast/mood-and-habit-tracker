import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '@/client/api-client';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getUser(): Promise<User | null> {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  async exchangeCodeForToken(code: string, redirectUri: string, clientId: string): Promise<{ token: string; user: User }> {
    try {
      console.log('[Auth Service] Enviando código al backend...');
      const response = await client.post('/api/auth/google', { code, redirectUri, clientId });
      
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      const { token, user } = response.data;
      
      await this.setToken(token);
      await this.setUser(user);
      
      console.log('[Auth Service] Token guardado exitosamente');
      return { token, user };
    } catch (error: any) {
      console.error('[Auth Service] Error al intercambiar código:', error);
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
        throw new Error(`Error del servidor: ${message}`);
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        throw error instanceof Error ? error : new Error('Error desconocido');
      }
    }
  },
};
