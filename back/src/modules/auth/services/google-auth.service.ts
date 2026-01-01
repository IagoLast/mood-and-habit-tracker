import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { generateToken } from '../../../common/utils/jwt';
import { InitializeDefaultCategoriesService } from '../../habits/services/initialize-default-categories.service';

export interface GoogleAuthResult {
  token: string;
  user: { id: string; email: string; name: string };
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class GoogleAuthService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly initializeDefaultCategoriesService: InitializeDefaultCategoriesService,
  ) {}

  async execute(params: GoogleAuthDto): Promise<GoogleAuthResult> {
    const { code, redirectUri } = params;

    if (!code || !redirectUri) {
      throw new BadRequestException('code and redirectUri are required');
    }

    // Ensure code and redirectUri are strings (they might be optional in DTO but required here)
    if (typeof code !== 'string' || typeof redirectUri !== 'string') {
      throw new BadRequestException('code and redirectUri must be strings');
    }

    const accessToken = await this.exchangeCodeForAccessToken(code, redirectUri);
    const userInfo = await this.getUserInfo(accessToken);
    return this.findOrCreateUser(userInfo);
  }

  private async exchangeCodeForAccessToken(code: string, redirectUri: string): Promise<string> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new UnauthorizedException('Google OAuth credentials not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error_description || error.error || 'Unknown error';
      
      console.error('[Google Auth Service] Error exchanging code:', {
        error: error.error,
        error_description: error.error_description,
        redirectUri,
      });
      
      if (error.error === 'invalid_grant') {
        throw new UnauthorizedException(
          `Invalid authorization code or redirect URI mismatch. Redirect URI used: ${redirectUri}. ` +
          `Make sure this URI is registered in Google Cloud Console.`
        );
      }
      
      throw new UnauthorizedException(`Google OAuth error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to get user info from Google');
    }

    return response.json();
  }

  private async findOrCreateUser(userInfo: GoogleUserInfo): Promise<GoogleAuthResult> {
    const { sub: googleId, email, name } = userInfo;

    if (!email) {
      throw new BadRequestException('Email not provided by Google');
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
