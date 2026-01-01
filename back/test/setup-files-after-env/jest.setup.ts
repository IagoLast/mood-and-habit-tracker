import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(__dirname, '../../.test-db-config.json');

if (fs.existsSync(configPath)) {
  const dbConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  process.env.DB_HOST = dbConfig.host;
  process.env.DB_PORT = dbConfig.port.toString();
  process.env.DB_NAME = dbConfig.database;
  process.env.DB_USER = dbConfig.user;
  process.env.DB_PASSWORD = dbConfig.password;
}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret';
