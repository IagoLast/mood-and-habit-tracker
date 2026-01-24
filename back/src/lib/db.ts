import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sslConfig = isProduction ? { rejectUnauthorized: false } : false;

    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'habittracker',
      user: process.env.DB_USER || 'habituser',
      password: process.env.DB_PASSWORD || 'habitpass',
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
    });

    pool.on('error', (err: Error & { code?: string }) => {
      if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE' && err.message !== 'aborted') {
        console.error('Database pool error:', err.message);
      }
    });
  }

  return pool;
}
