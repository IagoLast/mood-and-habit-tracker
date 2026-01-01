import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class CompletionsRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserIdAndDate(userId: string, date: string): Promise<number[]> {
    const result = await this.pool.query(
      `SELECT habit_id FROM daily_completions dc
       INNER JOIN habits h ON dc.habit_id = h.id
       INNER JOIN categories c ON h.category_id = c.id
       WHERE c.user_id = $1 AND dc.date = $2`,
      [userId, date]
    );
    return result.rows.map((row) => row.habit_id);
  }

  async deleteByUserIdAndDateWithClient(
    client: any,
    userId: string,
    date: string,
  ): Promise<void> {
    await client.query(
      `DELETE FROM daily_completions dc
       USING habits h, categories c
       WHERE dc.habit_id = h.id 
       AND h.category_id = c.id
       AND c.user_id = $1 
       AND dc.date = $2`,
      [userId, date]
    );
  }

  async createBatchWithClient(
    client: any,
    completions: Array<{ habitId: number; date: string }>,
  ): Promise<void> {
    if (completions.length === 0) return;

    const values = completions
      .map((e, i) => {
        const baseIndex = i * 2;
        return `($${baseIndex + 1}, $${baseIndex + 2})`;
      })
      .join(', ');

    const params: (number | string)[] = [];
    completions.forEach((e) => {
      params.push(e.habitId, e.date);
    });

    await client.query(
      `INSERT INTO daily_completions (habit_id, date) 
       VALUES ${values}
       ON CONFLICT (habit_id, date) DO NOTHING`,
      params
    );
  }
}
