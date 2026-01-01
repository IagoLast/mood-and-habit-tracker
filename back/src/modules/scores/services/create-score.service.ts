import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateScoreWithDateDto } from '../dto/create-score-with-date.dto';
import { ScoreResponseDto } from '../dto/score-response.dto';
import { getCurrentTimestampMs, normalizeDateZtsToUTC } from '../../../common/utils/timestamp';
import { ScoresRepository } from '../repositories/scores.repository';

interface CreateScoreParams {
  user: AuthenticatedUser;
  dto: CreateScoreWithDateDto;
}

@Injectable()
export class CreateScoreService {
  constructor(private readonly scoresRepository: ScoresRepository) {}

  async execute(params: CreateScoreParams): Promise<ScoreResponseDto> {
    const { user, dto } = params;
    const { dateZts, score } = dto;

    const normalizedDateZts = normalizeDateZtsToUTC(dateZts);
    const now = getCurrentTimestampMs();

    return await this.scoresRepository.upsert({
      userId: user.userId,
      dateZts: normalizedDateZts,
      score,
      createdAtTimestampMs: now,
      updatedAtTimestampMs: now,
    });
  }
}
