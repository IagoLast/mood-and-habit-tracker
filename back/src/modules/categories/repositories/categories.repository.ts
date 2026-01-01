import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class CategoriesRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findAllByUserId(userId: string) {
    const result = await this.pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findByIdAndUserId(id: number, userId: string) {
    const result = await this.pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async create(params: { name: string; userId: string; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `INSERT INTO categories (
        name, 
        user_id, 
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [params.name, params.userId, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
    return result.rows[0];
  }

  async createAndReturnId(params: { name: string; userId: string; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `INSERT INTO categories (
        name, 
        user_id, 
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4) RETURNING id`,
      [params.name, params.userId, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
    return result.rows[0].id;
  }

  async update(params: { id: number; userId: string; name: string; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `UPDATE categories SET 
        name = $1, 
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $2
      WHERE id = $3 AND user_id = $4 RETURNING *`,
      [params.name, params.updatedAtTimestampMs, params.id, params.userId]
    );
    return result.rows[0] || null;
  }

  async delete(id: number, userId: string) {
    const result = await this.pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0] || null;
  }
}
