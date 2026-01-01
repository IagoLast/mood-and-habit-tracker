import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { HealthResponseDto } from '../dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(): Promise<HealthResponseDto> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const versionResult = await this.pool.query('SELECT version()');
      const tablesResult = await this.pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      const statsResult = await this.pool.query(`
        SELECT 
          count(*) as total,
          count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      const responseTimeMs = Date.now() - startTime;

      return {
        status: 'healthy',
        database: {
          connected: true,
          version: versionResult.rows[0]?.version?.split(' ')[0] + ' ' + versionResult.rows[0]?.version?.split(' ')[1],
          responseTimeMs,
          tablesCount: parseInt(tablesResult.rows[0]?.count || '0', 10),
          totalConnections: parseInt(statsResult.rows[0]?.total || '0', 10),
          idleConnections: parseInt(statsResult.rows[0]?.idle || '0', 10),
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'not set',
          PORT: process.env.PORT || 'not set',
          DB_HOST: process.env.DB_HOST || 'not set',
          DB_PORT: process.env.DB_PORT || 'not set',
          DB_NAME: process.env.DB_NAME || 'not set',
          DB_USER: process.env.DB_USER || 'not set',
          DB_PASSWORD: process.env.DB_PASSWORD || 'not set',
          JWT_SECRET: process.env.JWT_SECRET || 'not set',
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'not set',
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'not set',
        },
        timestamp,
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      const responseTimeMs = Date.now() - startTime;

      return {
        status: 'unhealthy',
        database: {
          connected: false,
          responseTimeMs,
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'not set',
          PORT: process.env.PORT || 'not set',
          DB_HOST: process.env.DB_HOST || 'not set',
          DB_PORT: process.env.DB_PORT || 'not set',
          DB_NAME: process.env.DB_NAME || 'not set',
          DB_USER: process.env.DB_USER || 'not set',
          DB_PASSWORD: process.env.DB_PASSWORD || 'not set',
          JWT_SECRET: process.env.JWT_SECRET || 'not set',
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'not set',
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'not set',
        },
        timestamp,
      };
    }
  }
}
