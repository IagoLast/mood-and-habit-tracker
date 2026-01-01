import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpdateDayDto } from '../dto/update-day.dto';
import { DayResponseDto } from '../dto/day-response.dto';
import { getCurrentTimestampMs, dateStringToDateZts } from '../../../common/utils/timestamp';

interface UpdateDayParams {
  user: AuthenticatedUser;
  date: string;
  dto: UpdateDayDto;
}

@Injectable()
export class UpdateDayService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  private async verifyElementOwnership(elementIds: number[], userId: string): Promise<boolean> {
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

  async execute(params: UpdateDayParams): Promise<DayResponseDto> {
    const { user, date, dto } = params;
    const dateZts = dateStringToDateZts(date);

    if (dto.date_zts && dto.date_zts !== dateZts) {
      throw new BadRequestException('Date mismatch');
    }

    const elementIds = dto.elements.map((e) => e.elementId);
    const hasAccess = await this.verifyElementOwnership(elementIds, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('One or more elements not found');
    }

    const completedElements = dto.elements.filter((e) => e.completed === 'COMPLETED');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (dto.score !== undefined && dto.score !== null) {
        const now = getCurrentTimestampMs();
        await client.query(
          `INSERT INTO daily_scores (
            user_id, 
            date_zts, 
            score,
            created_at_timestamp_ms,
            updated_at_timestamp_ms
          ) VALUES ($1, $2, $3, $4, $5) 
          ON CONFLICT (user_id, date_zts) DO UPDATE SET 
            score = $3, 
            updated_at = CURRENT_TIMESTAMP,
            updated_at_timestamp_ms = $5`,
          [user.userId, dateZts, dto.score, now, now]
        );
      } else if (dto.score === null) {
        await client.query(
          'DELETE FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
          [user.userId, dateZts]
        );
      }

      await client.query(
        `DELETE FROM daily_completions dc
         USING elements e, categories c
         WHERE dc.element_id = e.id 
         AND e.category_id = c.id
         AND c.user_id = $1 
         AND dc.date_zts = $2`,
        [user.userId, dateZts]
      );
      if (completedElements.length > 0) {
        const now = getCurrentTimestampMs();
        const values = completedElements.map((e, i) => {
          const baseIndex = i * 3;
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
        }).join(', ');

        const params: (number | string | number)[] = [];
        completedElements.forEach((e) => {
          params.push(e.elementId, dateZts, now);
        });

        await client.query(
          `INSERT INTO daily_completions (element_id, date_zts, created_at_timestamp_ms) 
           VALUES ${values}
           ON CONFLICT (element_id, date_zts) DO UPDATE SET 
             created_at_timestamp_ms = EXCLUDED.created_at_timestamp_ms`,
          params
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const categoriesResult = await this.pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    );

    const scoreResult = await this.pool.query(
      'SELECT score FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [user.userId, dateZts]
    );

    const completedElementIds = new Set(
      completedElements.map((e) => e.elementId)
    );

    const categories = [];

    for (const category of categoriesResult.rows) {
      const elementsResult = await this.pool.query(
        'SELECT * FROM elements WHERE category_id = $1 ORDER BY created_at DESC',
        [category.id]
      );

      const elements = elementsResult.rows.map((element) => ({
        ...element,
        completed: completedElementIds.has(element.id),
      }));

      categories.push({
        ...category,
        elements,
      });
    }

    return {
      date_zts: dateZts,
      score: scoreResult.rows.length > 0 ? scoreResult.rows[0].score : null,
      categories,
    };
  }
}
