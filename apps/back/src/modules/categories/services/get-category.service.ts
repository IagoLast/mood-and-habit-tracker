import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CategoryResponseDto } from '../dto/category-response.dto';

interface GetCategoryParams {
  user: AuthenticatedUser;
  id: number;
}

@Injectable()
export class GetCategoryService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: GetCategoryParams): Promise<CategoryResponseDto> {
    const { user, id } = params;

    const result = await this.pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    return result.rows[0];
  }
}
