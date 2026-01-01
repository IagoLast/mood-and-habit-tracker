import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import { createTestApp, getRequest, getPool } from '../../../test/utils/test-app';
import { createTestUser } from '../../../test/utils/test-user';

describe('ElementsController (e2e)', () => {
  let app: INestApplication;
  let pool: Pool;
  let authToken: string;
  let userId: string;
  let categoryId: number;

  beforeAll(async () => {
    app = await createTestApp();
    pool = getPool(app);
    const testUser = await createTestUser(pool);
    authToken = testUser.token;
    userId = testUser.userId;

    const categoryResult = await pool.query(
      `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [`TestCategory_${Date.now()}`, userId, Date.now(), Date.now()]
    );
    categoryId = categoryResult.rows[0].id;
  });

  afterAll(async () => {
    if (pool) {
      pool.removeAllListeners();
      await pool.end();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await app.close();
  });

  describe('POST /api/elements', () => {
    it('should create an element', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const response = await getRequest(app)
        .post('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: uniqueName, categoryId })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(uniqueName);
      expect(response.body.category_id).toBe(categoryId);
    });

    it('should create an element with iconName', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const iconName = 'star';
      const response = await getRequest(app)
        .post('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: uniqueName, categoryId, iconName })
        .expect(201);

      expect(response.body.name).toBe(uniqueName);
      expect(response.body.icon_name).toBe(iconName);
    });

    it('should return 400 if name is missing', async () => {
      await getRequest(app)
        .post('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ categoryId })
        .expect(400);
    });

    it('should return 400 if categoryId is missing', async () => {
      await getRequest(app)
        .post('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Element' })
        .expect(400);
    });

    it('should return 404 if category not found', async () => {
      await getRequest(app)
        .post('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Element', categoryId: 999999 })
        .expect(404);
    });
  });

  describe('GET /api/elements', () => {
    it('should return list of elements wrapped in data', async () => {
      const uniqueName = `Element_${Date.now()}`;
      await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4)`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );

      const response = await getRequest(app)
        .get('/api/elements')
        .query({ categoryId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 if categoryId query param is missing', async () => {
      await getRequest(app)
        .get('/api/elements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 404 if category not found', async () => {
      await getRequest(app)
        .get('/api/elements')
        .query({ categoryId: 999999 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/elements/:id', () => {
    it('should return an element by id', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );
      const elementId = result.rows[0].id;

      const response = await getRequest(app)
        .get(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(elementId);
      expect(response.body.name).toBe(uniqueName);
    });

    it('should return 404 if element not found', async () => {
      await getRequest(app)
        .get('/api/elements/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return element from another user', async () => {
      const otherUser = await createTestUser(pool);
      const otherCategoryResult = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherCategory_${Date.now()}`, otherUser.userId, Date.now(), Date.now()]
      );
      const otherCategoryId = otherCategoryResult.rows[0].id;

      const elementResult = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherElement_${Date.now()}`, otherCategoryId, Date.now(), Date.now()]
      );
      const elementId = elementResult.rows[0].id;

      await getRequest(app)
        .get(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/elements/:id', () => {
    it('should update an element', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );
      const elementId = result.rows[0].id;
      const newName = `Updated_${Date.now()}`;

      const response = await getRequest(app)
        .put(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body.name).toBe(newName);
    });

    it('should update element iconName', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );
      const elementId = result.rows[0].id;
      const newIconName = 'heart';

      const response = await getRequest(app)
        .put(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: uniqueName, iconName: newIconName })
        .expect(200);

      expect(response.body.icon_name).toBe(newIconName);
    });

    it('should return 404 if element not found', async () => {
      await getRequest(app)
        .put('/api/elements/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should not update element from another user', async () => {
      const otherUser = await createTestUser(pool);
      const otherCategoryResult = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherCategory_${Date.now()}`, otherUser.userId, Date.now(), Date.now()]
      );
      const otherCategoryId = otherCategoryResult.rows[0].id;

      const elementResult = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherElement_${Date.now()}`, otherCategoryId, Date.now(), Date.now()]
      );
      const elementId = elementResult.rows[0].id;

      await getRequest(app)
        .put(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/elements/:id', () => {
    it('should delete an element', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );
      const elementId = result.rows[0].id;

      const response = await getRequest(app)
        .delete(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Element deleted successfully');

      const checkResult = await pool.query('SELECT * FROM elements WHERE id = $1', [elementId]);
      expect(checkResult.rows.length).toBe(0);
    });

    it('should return 404 if element not found', async () => {
      await getRequest(app)
        .delete('/api/elements/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not delete element from another user', async () => {
      const otherUser = await createTestUser(pool);
      const otherCategoryResult = await pool.query(
        `INSERT INTO categories (name, user_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherCategory_${Date.now()}`, otherUser.userId, Date.now(), Date.now()]
      );
      const otherCategoryId = otherCategoryResult.rows[0].id;

      const elementResult = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`OtherElement_${Date.now()}`, otherCategoryId, Date.now(), Date.now()]
      );
      const elementId = elementResult.rows[0].id;

      await getRequest(app)
        .delete(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const checkResult = await pool.query('SELECT * FROM elements WHERE id = $1', [elementId]);
      expect(checkResult.rows.length).toBe(1);
    });

    it('should cascade delete daily completions when deleting an element', async () => {
      const uniqueName = `Element_${Date.now()}`;
      const elementResult = await pool.query(
        `INSERT INTO elements (name, category_id, created_at_timestamp_ms, updated_at_timestamp_ms)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [uniqueName, categoryId, Date.now(), Date.now()]
      );
      const elementId = elementResult.rows[0].id;

      const dateZts = '2024-01-01';
      await pool.query(
        `INSERT INTO daily_completions (element_id, date_zts, created_at_timestamp_ms)
         VALUES ($1, $2, $3)`,
        [elementId, dateZts, Date.now()]
      );

      await getRequest(app)
        .delete(`/api/elements/${elementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const elementCheck = await pool.query('SELECT * FROM elements WHERE id = $1', [elementId]);
      expect(elementCheck.rows.length).toBe(0);

      const completionsCheck = await pool.query(
        'SELECT * FROM daily_completions WHERE element_id = $1',
        [elementId]
      );
      expect(completionsCheck.rows.length).toBe(0);
    });
  });
});
