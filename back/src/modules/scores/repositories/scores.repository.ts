import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ScoresRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserIdAndDate(userId: string, date: string) {
    const result = await this.pool.query(
      'SELECT score FROM daily_scores WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows.length > 0 ? result.rows[0].score : null;
  }

  async findByIdAndUserId(userId: string, date: string) {
    const result = await this.pool.query(
      'SELECT * FROM daily_scores WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    return result.rows[0] || null;
  }

  async findAllByUserId(userId: string, startDate?: string, endDate?: string) {
    let query = 'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, score FROM daily_scores WHERE user_id = $1';
    const queryParams: (string | number)[] = [userId];

    if (startDate && endDate) {
      query += ' AND date >= $2::date AND date <= $3::date ORDER BY date DESC';
      queryParams.push(startDate, endDate);
    } else {
      query += ' ORDER BY date DESC LIMIT 30';
    }

    const result = await this.pool.query(query, queryParams);
    return result.rows.map((row) => {
      return {
        id: row.id,
        date: row.date,
        score: row.score,
      };
    });
  }

  async deleteAndReturn(userId: string, date: string) {
    const result = await this.pool.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date = $2 RETURNING *',
      [userId, date]
    );
    return result.rows[0] || null;
  }

  async upsert(params: { userId: string; date: string; score: number }) {
    const result = await this.pool.query(
      `INSERT INTO daily_scores (
        user_id, 
        date, 
        score
      ) VALUES ($1, $2, $3) 
      ON CONFLICT (user_id, date) DO UPDATE SET 
        score = $3, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [params.userId, params.date, params.score]
    );
    return result.rows[0];
  }

  async delete(userId: string, date: string) {
    await this.pool.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
  }

  async upsertWithClient(client: any, params: { userId: string; date: string; score: number }) {
    const result = await client.query(
      `INSERT INTO daily_scores (
        user_id, 
        date, 
        score
      ) VALUES ($1, $2, $3) 
      ON CONFLICT (user_id, date) DO UPDATE SET 
        score = $3, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING score`,
      [params.userId, params.date, params.score]
    );
    return result.rows[0]?.score ?? null;
  }

  async deleteWithClient(client: any, userId: string, date: string) {
    await client.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
  }
}
