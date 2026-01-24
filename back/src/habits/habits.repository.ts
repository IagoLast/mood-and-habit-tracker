import { Pool } from 'pg';

export class HabitsRepository {
  constructor(private readonly pool: Pool) {}

  async findAllByCategoryId(categoryId: number) {
    const result = await this.pool.query(
      'SELECT * FROM habits WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    return result.rows;
  }

  async findByIdAndUserId(id: number, userId: string) {
    const result = await this.pool.query(
      `SELECT h.* FROM habits h
       INNER JOIN categories c ON h.category_id = c.id
       WHERE h.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async verifyOwnership(id: number, userId: string) {
    const result = await this.pool.query(
      `SELECT h.id FROM habits h
       INNER JOIN categories c ON h.category_id = c.id
       WHERE h.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    return result.rows.length > 0;
  }

  async verifyOwnershipBatch(habitIds: number[], userId: string) {
    if (habitIds.length === 0) return true;

    const placeholders = habitIds.map((_, i) => `$${i + 2}`).join(',');
    const result = await this.pool.query(
      `SELECT h.id FROM habits h
       INNER JOIN categories c ON h.category_id = c.id
       WHERE h.id IN (${placeholders}) AND c.user_id = $1`,
      [userId, ...habitIds]
    );
    return result.rows.length === habitIds.length;
  }

  async create(params: { name: string; categoryId: number; iconName: string | null }) {
    const result = await this.pool.query(
      `INSERT INTO habits (
        name,
        category_id,
        icon_name
      ) VALUES ($1, $2, $3) RETURNING *`,
      [params.name, params.categoryId, params.iconName]
    );
    return result.rows[0];
  }

  async createWithoutReturn(params: { name: string; categoryId: number; iconName: string | null }) {
    await this.pool.query(
      `INSERT INTO habits (
        name,
        category_id,
        icon_name
      ) VALUES ($1, $2, $3)`,
      [params.name, params.categoryId, params.iconName]
    );
  }

  async update(params: { id: number; name: string; iconName: string | null }) {
    const result = await this.pool.query(
      `UPDATE habits SET
        name = $1,
        icon_name = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *`,
      [params.name, params.iconName, params.id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number) {
    const result = await this.pool.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
