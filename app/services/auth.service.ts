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
    const response = await client.post('/api/auth/google', { 
      code, 
      redirectUri,
      codeVerifier,
    });
    const { token, user } = response.data;

    await this.setToken(token);
    await this.setUser(user);

    return { token, user };
  },
};
