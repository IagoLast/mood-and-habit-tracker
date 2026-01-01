import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateScoreWithDateDto } from '../dto/create-score-with-date.dto';
import { ScoreResponseDto } from '../dto/score-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface CreateScoreParams {
  user: AuthenticatedUser;
  dto: CreateScoreWithDateDto;
}

@Injectable()
export class CreateScoreService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: CreateScoreParams): Promise<ScoreResponseDto> {
    const { user, dto } = params;
    const { dateZts, score } = dto;

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
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
        updated_at_timestamp_ms = $5
      RETURNING *`,
      [user.userId, dateZts, score, now, now]
    );

    return result.rows[0];
  }
}
