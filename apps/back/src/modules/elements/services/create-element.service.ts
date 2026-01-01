import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateElementDto } from '../dto/create-element.dto';
import { ElementResponseDto } from '../dto/element-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface CreateElementParams {
  user: AuthenticatedUser;
  dto: CreateElementDto;
}

@Injectable()
export class CreateElementService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: CreateElementParams): Promise<ElementResponseDto> {
    const { user, dto } = params;
    const { name, categoryId, iconName } = dto;

    const categoryCheck = await this.pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, user.userId]
    );

    if (categoryCheck.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
      `INSERT INTO elements (
        name, 
        category_id,
        icon_name,
        created_at_timestamp_ms,
        updated_at_timestamp_ms
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, categoryId, iconName || null, now, now]
    );

    return result.rows[0];
  }
}
