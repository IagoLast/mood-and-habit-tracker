import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import { createTestApp, getRequest, getPool } from '../../../test/utils/test-app';
import { createTestUser } from '../../../test/utils/test-user';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let pool: Pool;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    pool = getPool(app);
    const testUser = await createTestUser(pool);
    authToken = testUser.token;
    userId = testUser.userId;
  });

  afterAll(async () => {
    if (pool) {
      // Remove all listeners to prevent logs after tests complete
      pool.removeAllListeners();
      await pool.end();
      // Small delay to ensure pool cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await app.close();
  });

  describe('POST /api/categories', () => {
    it('should create a category', async () => {
      const uniqueName = `Category_${Date.now()}`;
      const response = await getRequest(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: uniqueName })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(uniqueName);
      expect(response.body.user_id).toBe(userId);
    });

    it('should return 400 if name is missing', async () => {
      await getRequest(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/categories', () => {
    it('should return list of categories wrapped in data', async () => {
      const uniqueName = `Category_${Date.now()}`;
      await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4)`,
        [uniqueName, userId, Date.now(), Date.now()]
      );

      const response = await getRequest(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a category by id', async () => {
      const uniqueName = `Category_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, userId, Date.now(), Date.now()]
      );
      const categoryId = result.rows[0].id;

      const response = await getRequest(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe(uniqueName);
    });

    it('should return 404 if category not found', async () => {
      await getRequest(app)
        .get('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const uniqueName = `Category_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, userId, Date.now(), Date.now()]
      );
      const categoryId = result.rows[0].id;
      const newName = `Updated_${Date.now()}`;

      const response = await getRequest(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body.name).toBe(newName);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const uniqueName = `Category_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, userId, Date.now(), Date.now()]
      );
      const categoryId = result.rows[0].id;

      const response = await getRequest(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Category deleted successfully');

      const checkResult = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
      expect(checkResult.rows.length).toBe(0);
    });

    it('should return 404 if category not found', async () => {
      await getRequest(app)
        .delete('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not delete category from another user', async () => {
      const otherUser = await createTestUser(pool);
      const uniqueName = `Category_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, otherUser.userId, Date.now(), Date.now()]
      );
      const categoryId = result.rows[0].id;

      await getRequest(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const checkResult = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
      expect(checkResult.rows.length).toBe(1);
    });

    it('should cascade delete elements when deleting a category', async () => {
      const uniqueName = `Category_${Date.now()}`;
      const categoryResult = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, userId, Date.now(), Date.now()]
      );
      const categoryId = categoryResult.rows[0].id;

      const elementResult1 = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`Element1_${Date.now()}`, categoryId, Date.now(), Date.now()]
      );
      const elementId1 = elementResult1.rows[0].id;

      const elementResult2 = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`Element2_${Date.now()}`, categoryId, Date.now(), Date.now()]
      );
      const elementId2 = elementResult2.rows[0].id;

      await getRequest(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
      expect(categoryCheck.rows.length).toBe(0);

      const elementsCheck = await pool.query('SELECT * FROM elements WHERE category_id = $1', [categoryId]);
      expect(elementsCheck.rows.length).toBe(0);

      const element1Check = await pool.query('SELECT * FROM elements WHERE id = $1', [elementId1]);
      expect(element1Check.rows.length).toBe(0);

      const element2Check = await pool.query('SELECT * FROM elements WHERE id = $1', [elementId2]);
      expect(element2Check.rows.length).toBe(0);
    });
  });
});
