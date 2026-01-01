import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
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

async function exchangeCodeWithGoogle(code: string, codeVerifier: string, redirectUri: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error);
  }

  const data = await response.json();
  if (!data.id_token) {
    throw new Error('No id_token received from Google');
  }

  return data.id_token;
}

export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, , promptAsync] = AuthSession.useAuthRequest(
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
    if (!request || !request.codeVerifier) {
      throw new Error('Auth request not ready');
    }

    const result = await promptAsync();

    if (result.type !== 'success' || !result.params.code) {
      throw new Error('Google authentication failed');
    }

    const idToken = await exchangeCodeWithGoogle(
      result.params.code,
      request.codeVerifier,
      request.redirectUri || redirectUri
    );

    return authService.loginWithGoogleToken(idToken);
  };

  return {
    login,
    isLoading: !request,
  };
}
