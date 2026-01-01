import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { client } from '@/client/api-client';
import type { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || 
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const authService = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  async loginWithGoogle(): Promise<{ token: string; user: User }> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'books',
      useProxy: false,
    });

    const platform = Platform.OS === 'web' ? 'Web' : 'Mobile';
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔗 REDIRECT URI PARA GOOGLE CONSOLE:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Plataforma: ${platform}`);
    console.log(`Redirect URI: ${redirectUri}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 INSTRUCCIONES:');
    console.log('1. Copia el URI de arriba EXACTAMENTE');
    console.log('2. Ve a: https://console.cloud.google.com/apis/credentials');
    console.log('3. Selecciona tu proyecto');
    console.log('4. Abre tu OAuth 2.0 Client ID');
    console.log('5. En "Authorized redirect URIs", haz clic en "+ ADD URI"');
    console.log('6. Pega el URI copiado');
    console.log('7. Haz clic en "SAVE"');
    console.log('⚠️  IMPORTANTE: El URI debe coincidir EXACTAMENTE');
    if (platform === 'Web') {
      console.log('💡 NOTA: En web, el redirect URI suele ser tu URL actual');
      console.log('   (ej: http://localhost:8081 o https://tu-dominio.com)');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      extraParams: {},
      usePKCE: false,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      throw new Error('Google authentication cancelled or failed');
    }

    const { code } = result.params;
    if (!code) {
      throw new Error('No authorization code received from Google');
    }

    const response = await client.post('/api/auth/google', { code, redirectUri });
    const { token, user } = response.data;

    await this.setToken(token);
    await this.setUser(user);

    return { token, user };
  },
};
