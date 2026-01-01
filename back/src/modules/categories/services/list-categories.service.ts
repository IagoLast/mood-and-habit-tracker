import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ListCategoriesResult } from '../dto/category-response.dto';

interface ListCategoriesParams {
  user: AuthenticatedUser;
}

@Injectable()
export class ListCategoriesService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: ListCategoriesParams): Promise<ListCategoriesResult> {
    const { user } = params;

    const result = await this.pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    );

    return {
      data: result.rows,
    };
  }
}
