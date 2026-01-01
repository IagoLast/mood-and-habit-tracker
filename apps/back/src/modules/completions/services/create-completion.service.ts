import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateCompletionDto } from '../dto/create-completion.dto';
import { CompletionResponseDto } from '../dto/completion-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface CreateCompletionParams {
  user: AuthenticatedUser;
  dto: CreateCompletionDto;
}

@Injectable()
export class CreateCompletionService {
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

  async execute(params: CreateCompletionParams): Promise<CompletionResponseDto> {
    const { user, dto } = params;
    const { elementId, dateZts } = dto;

    const hasAccess = await this.verifyElementOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Element not found');
    }

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
      `INSERT INTO daily_completions (
        element_id, 
        date_zts, 
        created_at_timestamp_ms
      ) VALUES ($1, $2, $3) 
      ON CONFLICT (element_id, date_zts) 
      DO UPDATE SET 
        created_at_timestamp_ms = $3
      RETURNING *`,
      [elementId, dateZts, now]
    );

    return result.rows[0];
  }
}
