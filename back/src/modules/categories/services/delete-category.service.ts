import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';

interface DeleteCategoryParams {
  user: AuthenticatedUser;
  id: number;
}

@Injectable()
export class DeleteCategoryService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: DeleteCategoryParams): Promise<{ message: string }> {
    const { user, id } = params;

    const result = await this.pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }
}
