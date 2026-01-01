import * as fs from 'fs';
import * as path from 'path';
import { getContainer } from './jest.setup';

export default async function globalTeardown() {
  console.log('Stopping PostgreSQL test container...');

  try {
    const container = await getContainer();
    if (container) {
      await container.stop();
    }
  } catch (error) {
    console.error('Error stopping container:', error);
  }

  const configPath = path.join(__dirname, '../../.test-db-config.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }

  console.log('Test database stopped');
}
