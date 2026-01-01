import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ListElementsResult } from '../dto/element-response.dto';

interface ListElementsParams {
  user: AuthenticatedUser;
  categoryId: number;
}

@Injectable()
export class ListElementsService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: ListElementsParams): Promise<ListElementsResult> {
    const { user, categoryId } = params;

    const categoryCheck = await this.pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, user.userId]
    );

    if (categoryCheck.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    const result = await this.pool.query(
      'SELECT * FROM elements WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );

    return {
      data: result.rows,
    };
  }
}
