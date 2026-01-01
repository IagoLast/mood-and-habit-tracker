import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpdateElementDto } from '../dto/update-element.dto';
import { ElementResponseDto } from '../dto/element-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface UpdateElementParams {
  user: AuthenticatedUser;
  id: number;
  dto: UpdateElementDto;
}

@Injectable()
export class UpdateElementService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: UpdateElementParams): Promise<ElementResponseDto> {
    const { user, id, dto } = params;
    const { name, iconName } = dto;

    const ownershipCheck = await this.pool.query(
      `SELECT e.id FROM elements e
       INNER JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND c.user_id = $2`,
      [id, user.userId]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new NotFoundException('Element not found');
    }

    const now = getCurrentTimestampMs();

    const result = await this.pool.query(
      `UPDATE elements SET 
        name = $1,
        icon_name = $2,
        updated_at = CURRENT_TIMESTAMP,
        updated_at_timestamp_ms = $3
      WHERE id = $4 RETURNING *`,
      [name, iconName || null, now, id]
    );

    return result.rows[0];
  }
}
