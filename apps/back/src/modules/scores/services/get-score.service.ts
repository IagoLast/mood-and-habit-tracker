import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoreResponseDto } from '../dto/score-response.dto';

interface GetScoreParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class GetScoreService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: GetScoreParams): Promise<ScoreResponseDto> {
    const { user, date } = params;

    const result = await this.pool.query(
      'SELECT * FROM daily_scores WHERE user_id = $1 AND date_zts = $2',
      [user.userId, date]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Score not found');
    }

    return result.rows[0];
  }
}
