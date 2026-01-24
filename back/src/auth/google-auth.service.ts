import { Pool } from 'pg';
import { generateToken } from '@/lib/jwt';
import { InitializeDefaultCategoriesService } from '@/habits/initialize-default-categories.service';

export interface GoogleAuthResult {
  token: string;
  user: { id: string; email: string; name: string };
}

export interface GoogleAuthDto {
  code: string;
  redirectUri: string;
  clientId?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
}

export class GoogleAuthService {
  constructor(
    private readonly pool: Pool,
    private readonly initializeDefaultCategoriesService: InitializeDefaultCategoriesService,
  ) {}

  async execute(params: GoogleAuthDto): Promise<GoogleAuthResult> {
    const { code, redirectUri, clientId } = params;

    if (!code || !redirectUri) {
      throw new Error('code and redirectUri are required');
    }

    if (typeof code !== 'string' || typeof redirectUri !== 'string') {
      throw new Error('code and redirectUri must be strings');
    }

    const accessToken = await this.exchangeCodeForAccessToken(code, redirectUri, clientId);
    const userInfo = await this.getUserInfo(accessToken);
    return this.findOrCreateUser(userInfo);
  }

  private async exchangeCodeForAccessToken(code: string, redirectUri: string, clientId?: string): Promise<string> {
    // Detectar si es un cliente nativo (iOS/Android)
    // Los clientes nativos usan redirectUri con scheme personalizado, no https://
    const isNativeClient = redirectUri.includes('googleusercontent.apps') ||
                           !redirectUri.startsWith('https://') && !redirectUri.startsWith('http://localhost');

    // Para clientes nativos, usar el clientId que envió el frontend
    // Para web, usar el GOOGLE_CLIENT_ID del servidor
    const effectiveClientId = isNativeClient && clientId
      ? clientId
      : process.env.GOOGLE_CLIENT_ID;

    if (!effectiveClientId) {
      throw new Error('Google OAuth client ID not configured');
    }

    // Construir los parámetros del token exchange
    const params: Record<string, string> = {
      code,
      client_id: effectiveClientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    // Solo agregar client_secret para clientes web (los nativos no lo necesitan)
    if (!isNativeClient) {
      if (!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth client secret not configured');
      }
      params.client_secret = process.env.GOOGLE_CLIENT_SECRET;
    }

    console.log('[Google Auth Service] Token exchange:', {
      isNativeClient,
      clientId: effectiveClientId.substring(0, 20) + '...',
      redirectUri,
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error_description || error.error || 'Unknown error';

      console.error('[Google Auth Service] Error exchanging code:', {
        error: error.error,
        error_description: error.error_description,
        redirectUri,
        isNativeClient,
      });

      if (error.error === 'invalid_grant') {
        throw new Error(
          `Invalid authorization code or redirect URI mismatch. Redirect URI used: ${redirectUri}. ` +
          `Make sure this URI is registered in Google Cloud Console.`
        );
      }

      throw new Error(`Google OAuth error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    return response.json();
  }

  private async findOrCreateUser(userInfo: GoogleUserInfo): Promise<GoogleAuthResult> {
    const { sub: googleId, email, name } = userInfo;

    if (!email) {
      throw new Error('Email not provided by Google');
    }

    const existingUser = await this.pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

    let user;
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
      await this.pool.query(
        'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [name, email, user.id]
      );
      user.name = name;
      user.email = email;
    } else {
      const result = await this.pool.query(
        'INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *',
        [email, name, googleId]
      );
      user = result.rows[0];
      await this.initializeDefaultCategoriesService.execute({ userId: user.id });
    }

    const token = generateToken(user.id);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }
}
