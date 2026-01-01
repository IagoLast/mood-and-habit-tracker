import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';

interface DeleteElementParams {
  user: AuthenticatedUser;
  id: number;
}

@Injectable()
export class DeleteElementService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: DeleteElementParams): Promise<{ message: string }> {
    const { user, id } = params;

    const ownershipCheck = await this.pool.query(
      `SELECT e.id FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [id, user.userId]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new NotFoundException('Element not found');
    }

    const result = await this.pool.query('DELETE FROM elements WHERE id = $1 RETURNING *', [id]);

    return { message: 'Element deleted successfully' };
  }
}
