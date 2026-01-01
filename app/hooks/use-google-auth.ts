import { authService } from '@/services/auth.service';
import type { User } from '@/types';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = process.env.EXPO_PUBLIC_REDIRECT_URI || window.location.origin;

function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function useGoogleAuth() {
  const login = async (): Promise<{ token: string; user: User }> => {
    return new Promise((resolve, reject) => {
      const state = generateState();
      sessionStorage.setItem('oauth_state', state);

      const authUrl = buildGoogleAuthUrl(state);
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');

      if (!popup) {
        reject(new Error('Popup blocked'));
        return;
      }

      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            reject(new Error('Popup closed'));
            return;
          }

          const popupUrl = popup.location.href;
          if (popupUrl.startsWith(REDIRECT_URI)) {
            clearInterval(checkPopup);
            popup.close();

            const url = new URL(popupUrl);
            const code = url.searchParams.get('code');
            const returnedState = url.searchParams.get('state');
            const error = url.searchParams.get('error');

            if (error) {
              reject(new Error(error));
              return;
            }

            if (returnedState !== sessionStorage.getItem('oauth_state')) {
              reject(new Error('State mismatch'));
              return;
            }

            if (!code) {
              reject(new Error('No code received'));
              return;
            }

            sessionStorage.removeItem('oauth_state');

            authService.exchangeCodeForToken(code, REDIRECT_URI)
              .then(resolve)
              .catch(reject);
          }
        } catch {
          // Cross-origin error - popup still on Google domain
        }
      }, 100);
    });
  };

  return { login, isLoading: false };
}
