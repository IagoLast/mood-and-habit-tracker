import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';

interface DeleteCompletionParams {
  user: AuthenticatedUser;
  elementId: number;
  date: string;
}

@Injectable()
export class DeleteCompletionService {
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

  async execute(params: DeleteCompletionParams): Promise<{ message: string }> {
    const { user, elementId, date } = params;

    const hasAccess = await this.verifyElementOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Completion not found');
    }

    const result = await this.pool.query(
      'DELETE FROM daily_completions WHERE element_id = $1 AND date_zts = $2 RETURNING *',
      [elementId, date]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Completion not found');
    }

    return { message: 'Completion deleted successfully' };
  }
}
