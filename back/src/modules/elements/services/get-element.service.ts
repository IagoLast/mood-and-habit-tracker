import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ElementResponseDto } from '../dto/element-response.dto';

interface GetElementParams {
  user: AuthenticatedUser;
  id: number;
}

@Injectable()
export class GetElementService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: GetElementParams): Promise<ElementResponseDto> {
    const { user, id } = params;

    const result = await this.pool.query(
      `SELECT e.* FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Element not found');
    }

    return result.rows[0];
  }
}
