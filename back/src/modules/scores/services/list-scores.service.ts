import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoreResponseDto } from '../dto/score-response.dto';
import { ScoresRepository } from '../repositories/scores.repository';
import { normalizeDateZtsToUTC } from '../../../common/utils/timestamp';

interface ListScoresParams {
  user: AuthenticatedUser;
  startDate?: string;
  endDate?: string;
}

export interface ListScoresResult {
  data: ScoreResponseDto[];
}

@Injectable()
export class ListScoresService {
  constructor(private readonly scoresRepository: ScoresRepository) {}

  async execute(params: ListScoresParams): Promise<ListScoresResult> {
    const { user, startDate, endDate } = params;

    const normalizedStartDate = startDate ? normalizeDateZtsToUTC(startDate) : undefined;
    const normalizedEndDate = endDate ? normalizeDateZtsToUTC(endDate) : undefined;

    const scores = await this.scoresRepository.findAllByUserId(user.userId, normalizedStartDate, normalizedEndDate);

    return {
      data: scores,
    };
  }
}
