import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ScoresRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserIdAndDateZts(userId: string, dateZts: string) {
    const result = await this.pool.query(
      'SELECT score FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [userId, dateZts]
    );
    return result.rows.length > 0 ? result.rows[0].score : null;
  }

  async findByIdAndUserId(userId: string, dateZts: string) {
    const result = await this.pool.query(
      'SELECT * FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [userId, dateZts]
    );
    return result.rows[0] || null;
  }

  async findAllByUserId(userId: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM daily_scores WHERE user_id = $1';
    const queryParams: (string | number)[] = [userId];

    if (startDate && endDate) {
      query += ' AND date_zts >= $2 AND date_zts <= $3 ORDER BY date_zts DESC';
      queryParams.push(startDate, endDate);
    } else {
      query += ' ORDER BY date_zts DESC LIMIT 30';
    }

    const result = await this.pool.query(query, queryParams);
    return result.rows;
  }

  async deleteAndReturn(userId: string, dateZts: string) {
    const result = await this.pool.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date_zts = $2 RETURNING *',
      [userId, dateZts]
    );
    return result.rows[0] || null;
  }

  async upsert(params: { userId: string; dateZts: string; score: number; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `INSERT INTO daily_scores (
        user_id, 
        date_zts, 
        score,
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (user_id, date_zts) DO UPDATE SET 
        score = $3, 
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $5
      RETURNING *`,
      [params.userId, params.dateZts, params.score, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
    return result.rows[0];
  }

  async delete(userId: string, dateZts: string) {
    await this.pool.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [userId, dateZts]
    );
  }

  async upsertWithClient(client: any, params: { userId: string; dateZts: string; score: number; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    const result = await client.query(
      `INSERT INTO daily_scores (
        user_id, 
        date_zts, 
        score,
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (user_id, date_zts) DO UPDATE SET 
        score = $3, 
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $5
      RETURNING score`,
      [params.userId, params.dateZts, params.score, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
    return result.rows[0]?.score ?? null;
  }

  async deleteWithClient(client: any, userId: string, dateZts: string) {
    await client.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [userId, dateZts]
    );
  }
}
