import { Module, Global, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const logger = new Logger('DatabasePool');
        const isProduction = process.env.NODE_ENV === 'production';
        const sslConfig = isProduction 
          ? { rejectUnauthorized: false } // En producción (Vercel) generalmente se requiere SSL
          : false;
        
        logger.log('Connecting to database...');
        logger.log(`SSL enabled: ${!!sslConfig}`);
        
        const pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5433'),
          database: process.env.DB_NAME || 'habittracker',
          user: process.env.DB_USER || 'habituser',
          password: process.env.DB_PASSWORD || 'habitpass',
          ssl: sslConfig,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000, // Aumentado para producción
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

        // Logs reducidos para evitar spam en producción
        if (process.env.NODE_ENV !== 'production') {
          pool.on('connect', () => {
            logger.log('New connection established');
          });

          pool.on('acquire', () => {
            logger.log('Connection acquired from pool');
          });

          pool.on('remove', () => {
            logger.log('Connection removed from pool');
          });
        }

        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
