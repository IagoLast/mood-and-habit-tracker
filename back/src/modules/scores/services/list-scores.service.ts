import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ScoreResponseDto } from '../dto/score-response.dto';
import { ScoresRepository } from '../repositories/scores.repository';

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

    const scores = await this.scoresRepository.findAllByUserId(user.userId, startDate, endDate);

    return {
      data: scores,
    };
  }
}
