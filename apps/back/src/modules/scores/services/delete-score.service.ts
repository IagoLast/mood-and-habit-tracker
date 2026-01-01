import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';

interface DeleteScoreParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class DeleteScoreService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: DeleteScoreParams): Promise<{ message: string }> {
    const { user, date } = params;

    const result = await this.pool.query(
      'DELETE FROM daily_scores WHERE user_id = $1 AND date_zts = $2 RETURNING *',
      [user.userId, date]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Score not found');
    }

    return { message: 'Score deleted successfully' };
  }
}
