import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoreResponseDto } from '../dto/score-response.dto';
import { ScoresRepository } from '../repositories/scores.repository';
import { normalizeDateZtsToUTC } from '../../../common/utils/timestamp';

interface GetScoreParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class GetScoreService {
  constructor(private readonly scoresRepository: ScoresRepository) {}

  async execute(params: GetScoreParams): Promise<ScoreResponseDto> {
    const { user, date } = params;

    const normalizedDate = normalizeDateZtsToUTC(date);
    const score = await this.scoresRepository.findByIdAndUserId(user.userId, normalizedDate);

    if (!score) {
      throw new NotFoundException('Score not found');
    }

    return score;
  }
}
