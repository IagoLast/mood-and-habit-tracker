import { Pool } from 'pg';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Temporal } from 'temporal-polyfill';

const envFile = process.env.DOTENV_CONFIG_PATH || (fs.existsSync('.env.local') ? '.env.local' : '.env.production');
dotenv.config({ path: envFile });


function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isSummer(month: number): boolean {
  return month >= 6 && month <= 8;
}

async function fill2025DummyData() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'habittracker',
    user: process.env.DB_USER || 'habituser',
    password: process.env.DB_PASSWORD || 'habitpass',
    ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Connected successfully');

    const usersResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (usersResult.rows.length === 0) {
      throw new Error('No users found in database');
    }
    const userId = usersResult.rows[0].id;
    console.log(`Found user: ${userId}`);

    const categoriesResult = await pool.query(
      'SELECT id FROM categories WHERE user_id = $1',
      [userId]
    );
    const categoryIds = categoriesResult.rows.map((row) => row.id);
    console.log(`Found ${categoryIds.length} categories`);

    if (categoryIds.length === 0) {
      throw new Error('No categories found for user');
    }

    const habitsResult = await pool.query(
      `SELECT h.id FROM habits h
       INNER JOIN categories c ON h.category_id = c.id
       WHERE c.user_id = $1`,
      [userId]
    );
    const habitIds = habitsResult.rows.map((row) => row.id);
    console.log(`Found ${habitIds.length} habits`);

    if (habitIds.length === 0) {
      throw new Error('No habits found for user');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const timeZone = Temporal.Now.zonedDateTimeISO().timeZoneId;
      const year = 2025;
      let totalScores = 0;
      let totalCompletions = 0;

      for (let month = 1; month <= 12; month++) {
        const daysInMonth = Temporal.ZonedDateTime.from({
          year,
          month,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          timeZone,
        }).daysInMonth;

        const isSummerMonth = isSummer(month);
        console.log(`Processing ${month}/${year} (${daysInMonth} days, ${isSummerMonth ? 'summer' : 'regular'})...`);

        for (let day = 1; day <= daysInMonth; day++) {
          const plainDate = Temporal.PlainDate.from({ year, month, day }).toString();

          const score = isSummerMonth
            ? randomInt(8, 10)
            : randomInt(7, 10);

          await client.query(
            `INSERT INTO daily_scores (
              user_id, 
              date, 
              score
            ) VALUES ($1, $2, $3) 
            ON CONFLICT (user_id, date) DO UPDATE SET 
              score = $3, 
              updated_at = CURRENT_TIMESTAMP`,
            [userId, plainDate, score]
          );
          totalScores++;

          const completionRate = score / 10;
          const numCompletions = Math.floor(habitIds.length * completionRate * randomInt(80, 100) / 100);
          const selectedHabits = habitIds
            .sort(() => Math.random() - 0.5)
            .slice(0, numCompletions);

          if (selectedHabits.length > 0) {
            const values = selectedHabits
              .map((_, i) => {
                const baseIndex = i * 2;
                return `($${baseIndex + 1}, $${baseIndex + 2})`;
              })
              .join(', ');

            const params: (number | string)[] = [];
            selectedHabits.forEach((habitId) => {
              params.push(habitId, plainDate);
            });

            await client.query(
              `INSERT INTO daily_completions (habit_id, date) 
               VALUES ${values}
               ON CONFLICT (habit_id, date) DO NOTHING`,
              params
            );
            totalCompletions += selectedHabits.length;
          }
        }
      }

      await client.query('COMMIT');
      console.log(`\n✅ Successfully generated data for 2025:`);
      console.log(`   - ${totalScores} scores`);
      console.log(`   - ${totalCompletions} completions`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to fill dummy data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fill2025DummyData();
