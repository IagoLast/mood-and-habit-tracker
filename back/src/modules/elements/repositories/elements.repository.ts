import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ElementsRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findAllByCategoryId(categoryId: number) {
    const result = await this.pool.query(
      'SELECT * FROM elements WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    return result.rows;
  }

  async findByIdAndUserId(id: number, userId: string) {
    const result = await this.pool.query(
      `SELECT e.* FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async verifyOwnership(id: number, userId: string) {
    const result = await this.pool.query(
      `SELECT e.id FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    return result.rows.length > 0;
  }

  async verifyOwnershipBatch(elementIds: number[], userId: string) {
    if (elementIds.length === 0) return true;

    const placeholders = elementIds.map((_, i) => `$${i + 2}`).join(',');
    const result = await this.pool.query(
      `SELECT e.id FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id IN (${placeholders}) AND c.user_id = $1`,
      [userId, ...elementIds]
    );
    return result.rows.length === elementIds.length;
  }

  async create(params: { name: string; categoryId: number; iconName: string | null; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `INSERT INTO elements (
        name, 
        category_id,
        icon_name,
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [params.name, params.categoryId, params.iconName, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
    return result.rows[0];
  }

  async createWithoutReturn(params: { name: string; categoryId: number; iconName: string | null; createdAtTimestampMs: number; updatedAtTimestampMs: number }) {
    await this.pool.query(
      `INSERT INTO elements (
        name, 
        category_id,
        icon_name,
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4, $5)`,
      [params.name, params.categoryId, params.iconName, params.createdAtTimestampMs, params.updatedAtTimestampMs]
    );
  }

  async update(params: { id: number; name: string; iconName: string | null; updatedAtTimestampMs: number }) {
    const result = await this.pool.query(
      `UPDATE elements SET 
        name = $1,
        icon_name = $2,
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $3
      WHERE id = $4 RETURNING *`,
      [params.name, params.iconName, params.updatedAtTimestampMs, params.id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number) {
    const result = await this.pool.query('DELETE FROM elements WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
