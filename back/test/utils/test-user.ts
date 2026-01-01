import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { generateToken } from '../../src/modules/auth/utils/jwt';
import { getCurrentTimestampMs } from '../../src/common/utils/timestamp';
import { TEST_USER } from '../constants';

export async function createTestUser(pool: Pool): Promise<{ userId: string; token: string }> {
  const now = getCurrentTimestampMs();
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const uniqueGoogleId = `test-google-id-${Date.now()}`;

  const result = await pool.query(
    `INSERT INTO users (email, name, google_id, created_at_timestamp_ms, updated_at_timestamp_ms)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [uniqueEmail, TEST_USER.name, uniqueGoogleId, now, now]
  );

  const user = result.rows[0];
  const token = await generateToken(user.id);

  return {
    userId: user.id,
    token,
  };
}
