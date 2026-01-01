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
  // On web, use the current origin as redirect URI to ensure consistency
  // This ensures the redirect URI matches what Google expects
  const getRedirectUri = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.origin;
    }
    return AuthSession.makeRedirectUri({ useProxy: false });
  };

  const redirectUri = getRedirectUri();

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
    if (!request) {
      throw new Error('Auth request not ready');
    }

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    const platform = Platform.OS === 'web' ? 'Web' : 'Mobile';
    
    // Ensure we use the same redirect URI that was used in the authorization request
    const finalRedirectUri = getRedirectUri();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔗 REDIRECT URI PARA GOOGLE CONSOLE:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Plataforma: ${platform}`);
    console.log(`Redirect URI: ${finalRedirectUri}`);
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

    const result = await promptAsync();

    if (result.type !== 'success') {
      throw new Error('Google authentication cancelled or failed');
    }

    // Log the full result for debugging
    if (Platform.OS === 'web') {
      console.log('Auth result:', JSON.stringify(result, null, 2));
      if (typeof window !== 'undefined') {
        console.log('Current URL:', window.location.href);
        console.log('Current origin:', window.location.origin);
      }
    }

    const { code } = result.params;
    if (!code) {
      throw new Error('No authorization code received from Google');
    }

    const codeVerifier = request.codeVerifier || undefined;

    // Use the same redirect URI that was used in the authorization request
    return await authService.exchangeCodeForToken(code, finalRedirectUri, codeVerifier);
  };

  return {
    request,
    response,
    login,
    isLoading: !request,
  };
}
