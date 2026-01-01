import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || 
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  const login = async (): Promise<{ token: string; user: User }> => {
    console.log('[GOOGLE AUTH] ========== INICIO LOGIN ==========');
    console.log('[GOOGLE AUTH] Platform:', Platform.OS);
    console.log('[GOOGLE AUTH] Client ID:', GOOGLE_CLIENT_ID ? '✓ Configurado' : '✗ NO CONFIGURADO');
    
    if (!request) {
      console.error('[GOOGLE AUTH] ERROR: Auth request not ready');
      throw new Error('Auth request not ready');
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('[GOOGLE AUTH] ERROR: Google Client ID not configured');
      throw new Error('Google Client ID not configured');
    }

    console.log('[GOOGLE AUTH] Redirect URI configurado:', redirectUri);
    console.log('[GOOGLE AUTH] Redirect URI del request:', request.redirectUri);
    console.log('[GOOGLE AUTH] Code verifier existe:', !!request.codeVerifier);
    console.log('[GOOGLE AUTH] Code challenge existe:', !!request.codeChallenge);
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('[GOOGLE AUTH] Window location origin:', window.location.origin);
      console.log('[GOOGLE AUTH] Window location href:', window.location.href);
    }

    console.log('[GOOGLE AUTH] Abriendo Google OAuth...');
    const result = await promptAsync();
    console.log('[GOOGLE AUTH] Resultado recibido:', result.type);
    console.log('[GOOGLE AUTH] Result completo:', JSON.stringify(result, null, 2));

    if (result.type !== 'success') {
      console.error('[GOOGLE AUTH] ERROR: Autenticación cancelada o fallida');
      throw new Error('Google authentication cancelled or failed');
    }

    const { code } = result.params;
    if (!code) {
      console.error('[GOOGLE AUTH] ERROR: No se recibió código de autorización');
      throw new Error('No authorization code received from Google');
    }

    console.log('[GOOGLE AUTH] Código recibido:', code.substring(0, 20) + '...');
    const codeVerifier = request.codeVerifier || undefined;
    const finalRedirectUri = request.redirectUri || redirectUri;
    
    console.log('[GOOGLE AUTH] Enviando al backend:');
    console.log('[GOOGLE AUTH]   - Code:', code.substring(0, 20) + '...');
    console.log('[GOOGLE AUTH]   - Redirect URI:', finalRedirectUri);
    console.log('[GOOGLE AUTH]   - Code Verifier:', codeVerifier ? '✓ Presente' : '✗ No presente');

    try {
      const result = await authService.exchangeCodeForToken(code, finalRedirectUri, codeVerifier);
      console.log('[GOOGLE AUTH] ✓ Login exitoso');
      console.log('[GOOGLE AUTH] ========== FIN LOGIN ==========');
      return result;
    } catch (error) {
      console.error('[GOOGLE AUTH] ERROR en exchangeCodeForToken:');
      console.error('[GOOGLE AUTH] Error:', error);
      if (error instanceof Error) {
        console.error('[GOOGLE AUTH] Error message:', error.message);
        console.error('[GOOGLE AUTH] Error stack:', error.stack);
      }
      console.log('[GOOGLE AUTH] ========== FIN LOGIN (ERROR) ==========');
      throw error;
    }
  };

  return {
    request,
    response,
    login,
    isLoading: !request,
  };
}
