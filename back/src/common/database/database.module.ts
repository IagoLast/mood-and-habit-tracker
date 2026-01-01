import { Module, Global, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const logger = new Logger('DatabasePool');
        const pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5433'),
          database: process.env.DB_NAME || 'habittracker',
          user: process.env.DB_USER || 'habituser',
          password: process.env.DB_PASSWORD || 'habitpass',
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          allowExitOnIdle: true,
        });

        pool.on('error', (err: Error & { code?: string }) => {
          logger.log('Error event:', {
            message: err.message,
            code: err.code,
            stack: err.stack?.split('\n')[0],
          });

          if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE' && err.message !== 'aborted') {
            logger.error('Critical error:', err.message);
          } else {
            logger.log('Ignoring connection reset error (common in development)');
          }
        });

        pool.on('connect', () => {
          logger.log('New connection established');
        });

        pool.on('acquire', () => {
          logger.log('Connection acquired from pool');
        });

        pool.on('remove', () => {
          logger.log('Connection removed from pool');
        });

        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
