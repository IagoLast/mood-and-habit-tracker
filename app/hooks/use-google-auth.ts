import { useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

const getRedirectUri = () => {
  if (process.env.EXPO_PUBLIC_REDIRECT_URI) {
    return process.env.EXPO_PUBLIC_REDIRECT_URI;
  }
  
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      console.log('[Google Auth] Web redirect URI:', origin);
      return origin;
    }
    return '';
  }
  
  const uri = AuthSession.makeRedirectUri({
    scheme: 'books',
    path: 'auth',
  });
  console.log('[Google Auth] Native redirect URI:', uri);
  return uri;
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
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID no está configurado. Verifica las variables de entorno.');
      }

      const redirectUri = getRedirectUri();
      
      if (!redirectUri) {
        throw new Error('No se pudo determinar el redirect URI');
      }

      console.log('[Google Auth] Iniciando autenticación...');
      console.log('[Google Auth] Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
      console.log('[Google Auth] Redirect URI:', redirectUri);
      console.log('[Google Auth] Platform:', Platform.OS);

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'email', 'profile'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        usePKCE: false,
      });

      console.log('[Google Auth] Abriendo navegador para autenticación...');
      const result = await request.promptAsync(discovery);

      console.log('[Google Auth] Resultado:', result.type);

      if (result.type === 'success') {
        const { code, error, error_description } = result.params;

        if (error) {
          console.error('[Google Auth] Error en respuesta:', error, error_description);
          throw new Error(error_description || error || 'Error durante la autenticación');
        }

        if (!code) {
          console.error('[Google Auth] No se recibió código de autorización');
          throw new Error('No se recibió el código de autorización de Google');
        }

        console.log('[Google Auth] Código recibido, intercambiando por token...');
        console.log('[Google Auth] Redirect URI enviado al backend:', redirectUri);
        
        const authResult = await authService.exchangeCodeForToken(code, redirectUri);
        console.log('[Google Auth] Autenticación exitosa');
        return authResult;
      } else if (result.type === 'error') {
        const errorMsg = result.error?.message || result.error?.code || 'Error desconocido';
        console.error('[Google Auth] Error:', result.error);
        throw new Error(`Error de autenticación: ${errorMsg}`);
      } else {
        console.log('[Google Auth] Autenticación cancelada por el usuario');
        throw new Error('Autenticación cancelada');
      }
    } catch (error) {
      console.error('[Google Auth] Error completo:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido durante la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
