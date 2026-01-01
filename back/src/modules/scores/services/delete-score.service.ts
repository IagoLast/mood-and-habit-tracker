import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoresRepository } from '../repositories/scores.repository';
import { normalizeDateZtsToUTC } from '../../../common/utils/timestamp';

interface DeleteScoreParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class DeleteScoreService {
  constructor(private readonly scoresRepository: ScoresRepository) {}

  async execute(params: DeleteScoreParams): Promise<{ message: string }> {
    const { user, date } = params;

    const normalizedDate = normalizeDateZtsToUTC(date);
    const score = await this.scoresRepository.deleteAndReturn(user.userId, normalizedDate);

    if (!score) {
      throw new NotFoundException('Score not found');
    }

    return { message: 'Score deleted successfully' };
  }
}
