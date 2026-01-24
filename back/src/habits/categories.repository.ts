import { Pool } from 'pg';

export class CategoriesRepository {
  constructor(private readonly pool: Pool) {}

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

  async create(params: { name: string; userId: string }) {
    const result = await this.pool.query(
      `INSERT INTO categories (
        name,
        user_id
      ) VALUES ($1, $2) RETURNING *`,
      [params.name, params.userId]
    );
    return result.rows[0];
  }

  async createAndReturnId(params: { name: string; userId: string }) {
    const result = await this.pool.query(
      `INSERT INTO categories (
        name,
        user_id
      ) VALUES ($1, $2) RETURNING id`,
      [params.name, params.userId]
    );
    return result.rows[0].id;
  }

  async update(params: { id: number; userId: string; name: string }) {
    const result = await this.pool.query(
      `UPDATE categories SET
        name = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3 RETURNING *`,
      [params.name, params.id, params.userId]
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
