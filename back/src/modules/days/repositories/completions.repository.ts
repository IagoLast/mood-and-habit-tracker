import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class CompletionsRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserIdAndDateZts(userId: string, dateZts: string): Promise<number[]> {
    const result = await this.pool.query(
      `SELECT element_id FROM daily_completions dc
       INNER JOIN elements e ON dc.element_id = e.id
       INNER JOIN categories c ON e.category_id = c.id
       WHERE c.user_id = $1 AND dc.date_zts = $2`,
      [userId, dateZts]
    );
    return result.rows.map((row) => row.element_id);
  }

  async deleteByUserIdAndDateZtsWithClient(
    client: any,
    userId: string,
    dateZts: string,
  ): Promise<void> {
    await client.query(
      `DELETE FROM daily_completions dc
       USING elements e, categories c
       WHERE dc.element_id = e.id 
       AND e.category_id = c.id
       AND c.user_id = $1 
       AND dc.date_zts = $2`,
      [userId, dateZts]
    );
  }

  async createBatchWithClient(
    client: any,
    completions: Array<{ elementId: number; dateZts: string; createdAtTimestampMs: number }>,
  ): Promise<void> {
    if (completions.length === 0) return;

    const values = completions
      .map((e, i) => {
        const baseIndex = i * 3;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
      })
      .join(', ');

    const params: (number | string | number)[] = [];
    completions.forEach((e) => {
      params.push(e.elementId, e.dateZts, e.createdAtTimestampMs);
    });

    await client.query(
      `INSERT INTO daily_completions (element_id, date_zts, created_at_timestamp_ms) 
       VALUES ${values}
       ON CONFLICT (element_id, date_zts) DO UPDATE SET 
         created_at_timestamp_ms = EXCLUDED.created_at_timestamp_ms`,
      params
    );
  }
}
