import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ListCompletionsResult } from '../dto/completion-response.dto';

interface ListCompletionsParams {
  user: AuthenticatedUser;
  elementId: number;
  date?: string;
}

@Injectable()
export class ListCompletionsService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  private async verifyElementOwnership(elementId: number, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT e.id FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [elementId, userId]
    );
    return result.rows.length > 0;
  }

  async execute(params: ListCompletionsParams): Promise<ListCompletionsResult> {
    const { user, elementId, date } = params;

    const hasAccess = await this.verifyElementOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Element not found');
    }

    let query = 'SELECT * FROM daily_completions WHERE element_id = $1';
    const queryParams: (number | string)[] = [elementId];

    if (date) {
      query += ' AND date_zts = $2';
      queryParams.push(date);
    } else {
      query += ' ORDER BY date_zts DESC';
    }

    const result = await this.pool.query(query, queryParams);

    return {
      data: result.rows,
    };
  }
}
