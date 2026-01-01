import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface CreateCategoryParams {
  user: AuthenticatedUser;
  dto: CreateCategoryDto;
}

@Injectable()
export class CreateCategoryService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: CreateCategoryParams): Promise<CategoryResponseDto> {
    const { user, dto } = params;
    const { name } = dto;

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
      `INSERT INTO categories (
        name, 
        user_id, 
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, user.userId, now, now]
    );

    return result.rows[0];
  }
}
