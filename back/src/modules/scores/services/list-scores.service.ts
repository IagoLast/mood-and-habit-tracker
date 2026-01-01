import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoreResponseDto } from '../dto/score-response.dto';

interface ListScoresParams {
  user: AuthenticatedUser;
  startDate?: string;
  endDate?: string;
}

export interface ListScoresResult {
  data: ScoreResponseDto[];
}

@Injectable()
export class ListScoresService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: ListScoresParams): Promise<ListScoresResult> {
    const { user, startDate, endDate } = params;

    let query = 'SELECT * FROM daily_scores WHERE user_id = $1';
    const queryParams: (string | number)[] = [user.userId];

    if (startDate && endDate) {
      query += ' AND date_zts >= $2 AND date_zts <= $3 ORDER BY date_zts DESC';
      queryParams.push(startDate, endDate);
    } else {
      query += ' ORDER BY date_zts DESC LIMIT 30';
    }

    const result = await this.pool.query(query, queryParams);

    return {
      data: result.rows,
    };
  }
}
