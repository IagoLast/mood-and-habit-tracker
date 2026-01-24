import { useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

const getClientId = () => {
  if (Platform.OS === 'ios') {
    return GOOGLE_IOS_CLIENT_ID;
  }
  return GOOGLE_WEB_CLIENT_ID;
};

const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  if (Platform.OS === 'ios') {
    // Usar el reversed client ID de iOS con el path estándar de Google
    const reversedClientId = GOOGLE_IOS_CLIENT_ID.split('.').reverse().join('.');
    return `${reversedClientId}:/oauth2redirect/google`;
  }

  // Android (para futuro)
  return AuthSession.makeRedirectUri({
    scheme: 'books',
    path: 'auth',
  });
};

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (): Promise<{ token: string; user: User }> => {
    setIsLoading(true);
    try {
      const clientId = getClientId();
      const redirectUri = getRedirectUri();

      if (!clientId) {
        throw new Error('Google Client ID no configurado para esta plataforma');
      }

      if (!redirectUri) {
        throw new Error('No se pudo determinar el redirect URI');
      }

      console.log('[Google Auth] Platform:', Platform.OS);
      console.log('[Google Auth] Client ID:', clientId.substring(0, 20) + '...');
      console.log('[Google Auth] Redirect URI:', redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'email', 'profile'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        usePKCE: false,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;

        if (!code) {
          throw new Error('No se recibió el código de autorización');
        }

        const authResult = await authService.exchangeCodeForToken(code, redirectUri, clientId);
        return authResult;
      } else if (result.type === 'error') {
        throw new Error(`Error de autenticación: ${result.error?.message || 'Error desconocido'}`);
      } else {
        throw new Error('Autenticación cancelada');
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Error desconocido durante la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
