import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface UpdateCategoryParams {
  user: AuthenticatedUser;
  id: number;
  dto: UpdateCategoryDto;
}

@Injectable()
export class UpdateCategoryService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: UpdateCategoryParams): Promise<CategoryResponseDto> {
    const { user, id, dto } = params;
    const { name } = dto;

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
      `UPDATE categories SET 
        name = $1, 
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $2
      WHERE id = $3 AND user_id = $4 RETURNING *`,
      [name, now, id, user.userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    return result.rows[0];
  }
}
