import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { DayResponseDto, DayCategory, DayElement } from '../dto/day-response.dto';
import { dateStringToDateZts } from '../../../common/utils/timestamp';

interface GetDayParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class GetDayService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: GetDayParams): Promise<DayResponseDto> {
    const { user, date } = params;
    const dateZts = dateStringToDateZts(date);

    const categoriesResult = await this.pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    );

    const scoreResult = await this.pool.query(
      'SELECT score FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [user.userId, dateZts]
    );

    const completionsResult = await this.pool.query(
      `SELECT element_id FROM daily_completions dc
       INNER JOIN elements e ON dc.element_id = e.id
       INNER JOIN categories c ON e.category_id = c.id
       WHERE c.user_id = $1 AND dc.date_zts = $2`,
      [user.userId, dateZts]
    );

    const completedElementIds = new Set(
      completionsResult.rows.map((row) => row.element_id)
    );

    const categories: DayCategory[] = [];

    for (const category of categoriesResult.rows) {
      const elementsResult = await this.pool.query(
        'SELECT * FROM elements WHERE category_id = $1 ORDER BY created_at DESC',
        [category.id]
      );

      const elements: DayElement[] = elementsResult.rows.map((element) => ({
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
