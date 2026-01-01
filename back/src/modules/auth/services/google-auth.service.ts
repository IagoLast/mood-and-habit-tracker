import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { OAuth2Client } from 'google-auth-library';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { generateToken } from '../utils/jwt';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';
import { InitializeDefaultCategoriesService } from '../../categories/services/initialize-default-categories.service';

export interface GoogleAuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client: OAuth2Client;

  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly initializeDefaultCategoriesService: InitializeDefaultCategoriesService,
  ) {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  async execute(params: GoogleAuthDto): Promise<GoogleAuthResult> {
    this.logger.log('========== GOOGLE AUTH SERVICE ==========');
    const { code, redirectUri, codeVerifier, googleToken } = params;

    this.logger.log('Parámetros recibidos:');
    this.logger.log(`  - Code: ${code ? code.substring(0, 20) + '...' : 'undefined'}`);
    this.logger.log(`  - Redirect URI: ${redirectUri || 'undefined'}`);
    this.logger.log(`  - Code Verifier: ${codeVerifier ? codeVerifier.substring(0, 20) + '...' : 'undefined'}`);
    this.logger.log(`  - Google Token: ${googleToken ? 'presente' : 'undefined'}`);
    this.logger.log(`  - GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configurado' : '✗ NO CONFIGURADO'}`);
    this.logger.log(`  - GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✓ Configurado' : '✗ NO CONFIGURADO'}`);

    let payload;

    if (code && redirectUri) {
      try {
        this.logger.log('Intercambiando código por token...');
        const tokenOptions: any = {
          code,
          redirect_uri: redirectUri,
        };

        if (codeVerifier) {
          tokenOptions.code_verifier = codeVerifier;
          this.logger.log('✓ Code verifier incluido');
        } else {
          this.logger.warn('⚠ Code verifier NO incluido (PKCE puede fallar)');
        }

        this.logger.log('Token options:', JSON.stringify({
          code: code.substring(0, 20) + '...',
          redirect_uri: redirectUri,
          has_code_verifier: !!codeVerifier,
        }));

        const { tokens } = await this.client.getToken(tokenOptions);
        this.logger.log('✓ Token recibido de Google');

        if (!tokens.id_token) {
          this.logger.error('✗ No ID token recibido de Google');
          throw new UnauthorizedException('No ID token received from Google');
        }

        this.logger.log('Verificando ID token...');
        const ticket = await this.client.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        payload = ticket.getPayload();
        this.logger.log(`✓ ID token verificado para usuario: ${payload?.email || 'unknown'}`);
      } catch (error) {
        this.logger.error('========== ERROR EN EXCHANGE ==========');
        this.logger.error('Error exchanging code for token:', error);
        this.logger.error('Code completo:', code);
        this.logger.error('Redirect URI:', redirectUri);
        this.logger.error('Code Verifier:', codeVerifier || 'NO PRESENTE');
        this.logger.error('Redirect URI length:', redirectUri?.length);
        this.logger.error('Redirect URI characters:', JSON.stringify(redirectUri));
        if (error instanceof Error) {
          this.logger.error('Error name:', error.name);
          this.logger.error('Error message:', error.message);
          this.logger.error('Error stack:', error.stack);
        }
        if ((error as any).response) {
          this.logger.error('Google API response:', JSON.stringify((error as any).response.data, null, 2));
        }
        this.logger.error('==========================================');
        throw new UnauthorizedException('Invalid authorization code');
      }
    } else if (googleToken) {
      try {
        const ticket = await this.client.verifyIdToken({
          idToken: googleToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (error) {
        this.logger.error('Error verifying Google token:', error);
        throw new UnauthorizedException('Invalid Google token');
      }
    } else {
      throw new BadRequestException('Either code+redirectUri or googleToken is required');
    }

    if (!payload) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email || 'User';

    if (!email) {
      throw new BadRequestException('Email not provided by Google');
    }

    let user;
    const existingUser = await this.pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];

      const now = getCurrentTimestampMs();
      await this.pool.query(
        `UPDATE users SET 
          name = $1, 
          email = $2, 
          updated_at = CURRENT_TIMESTAMP,
          updated_at_timestamp_ms = $3
        WHERE id = $4`,
        [name, email, now, user.id]
      );
      user.name = name;
      user.email = email;
    } else {
      const now = getCurrentTimestampMs();
      const result = await this.pool.query(
        `INSERT INTO users (email, name, google_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [email, name, googleId, now, now]
      );
      user = result.rows[0];

      await this.initializeDefaultCategoriesService.execute({ userId: user.id });
    }

    const token = await generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
