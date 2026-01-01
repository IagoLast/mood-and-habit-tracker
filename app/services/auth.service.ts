import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { client } from '@/client/api-client';
import type { User } from '@/types';

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

export const authService = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
      }
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  async clearToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing token:', error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      let userJson: string | null;
      if (Platform.OS === 'web') {
        userJson = localStorage.getItem(USER_STORAGE_KEY);
      } else {
        userJson = await SecureStore.getItemAsync(USER_STORAGE_KEY);
      }
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      const userJson = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_STORAGE_KEY, userJson);
      } else {
        await SecureStore.setItemAsync(USER_STORAGE_KEY, userJson);
      }
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  async exchangeCodeForToken(code: string, redirectUri: string, codeVerifier?: string): Promise<{ token: string; user: User }> {
    console.log('[AUTH SERVICE] ========== EXCHANGE CODE FOR TOKEN ==========');
    console.log('[AUTH SERVICE] Code:', code.substring(0, 20) + '...');
    console.log('[AUTH SERVICE] Redirect URI:', redirectUri);
    console.log('[AUTH SERVICE] Code Verifier:', codeVerifier ? codeVerifier.substring(0, 20) + '...' : 'undefined');
    console.log('[AUTH SERVICE] API URL:', client.defaults.baseURL);
    
    try {
      const payload = { 
        code, 
        redirectUri,
        codeVerifier,
      };
      console.log('[AUTH SERVICE] Enviando payload al backend...');
      const response = await client.post('/api/auth/google', payload);
      console.log('[AUTH SERVICE] Respuesta recibida:', response.status, response.statusText);
      
      const { token, user } = response.data;
      console.log('[AUTH SERVICE] Token recibido:', token ? '✓' : '✗');
      console.log('[AUTH SERVICE] User recibido:', user ? `✓ (${user.email})` : '✗');

      await this.setToken(token);
      await this.setUser(user);
      console.log('[AUTH SERVICE] ✓ Token y user guardados');
      console.log('[AUTH SERVICE] ========== FIN EXCHANGE ==========');
      return { token, user };
    } catch (error: any) {
      console.error('[AUTH SERVICE] ERROR en exchangeCodeForToken:');
      console.error('[AUTH SERVICE] Error:', error);
      if (error.response) {
        console.error('[AUTH SERVICE] Response status:', error.response.status);
        console.error('[AUTH SERVICE] Response data:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.request) {
        console.error('[AUTH SERVICE] Request:', error.request);
      }
      console.log('[AUTH SERVICE] ========== FIN EXCHANGE (ERROR) ==========');
      throw error;
    }
  },
};
