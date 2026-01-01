import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envFile = process.env.DOTENV_CONFIG_PATH || (fs.existsSync('.env.local') ? '.env.local' : '.env.production');
dotenv.config({ path: envFile });

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Connected successfully');

    const initSqlPath = path.join(__dirname, '../db/A0000-init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');

    console.log('Running migrations...');
    await pool.query(initSql);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
