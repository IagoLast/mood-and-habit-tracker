import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { generateToken } from '../../src/common/utils/jwt';
import { TEST_USER } from '../constants';

export async function createTestUser(pool: Pool): Promise<{ userId: string; token: string }> {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const uniqueGoogleId = `test-google-id-${Date.now()}`;

  const result = await pool.query(
    `INSERT INTO users (email, name, google_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [uniqueEmail, TEST_USER.name, uniqueGoogleId]
  );

  const user = result.rows[0];
  const token = await generateToken(user.id);

  return {
    userId: user.id,
    token,
  };
}
