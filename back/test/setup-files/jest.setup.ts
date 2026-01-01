import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import * as fs from 'fs';
import * as path from 'path';

let container: StartedPostgreSqlContainer;

export default async function globalSetup() {
  console.log('Starting PostgreSQL test container...');

  container = await new PostgreSqlContainer()
    .withDatabase('habittracker_test')
    .withUsername('habituser')
    .withPassword('habitpass')
    .withExposedPorts(5432)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);

  const dbConfig = {
    host,
    port,
    database: 'habittracker_test',
    user: 'habituser',
    password: 'habitpass',
  };

  fs.writeFileSync(
    path.join(__dirname, '../../.test-db-config.json'),
    JSON.stringify(dbConfig, null, 2)
  );

  process.env.DB_HOST = host;
  process.env.DB_PORT = port.toString();
  process.env.DB_NAME = 'habittracker_test';
  process.env.DB_USER = 'habituser';
  process.env.DB_PASSWORD = 'habitpass';

  console.log(`Test database started at ${host}:${port}`);

  const pool = await import('pg').then((m) => {
    const { Pool } = m;
    return new Pool({
      ...dbConfig,
      max: 20,
    });
  });

  const initSql = fs.readFileSync(
    path.join(__dirname, '../../db/A0000-init.sql'),
    'utf-8'
  );

  await pool.query(initSql);
  await pool.end();

  console.log('Database schema initialized');
}

export async function getContainer() {
  return container;
}
