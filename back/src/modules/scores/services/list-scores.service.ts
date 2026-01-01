import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ListScoresResponseDto } from '../dto/score-response.dto';
import { ScoresRepository } from '../repositories/scores.repository';
import { normalizePlainDate } from '../../../common/utils/timestamp';

interface ListScoresParams {
  user: AuthenticatedUser;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ListScoresService {
  constructor(private readonly scoresRepository: ScoresRepository) {}

  async execute(params: ListScoresParams): Promise<ListScoresResponseDto> {
    const { user, startDate, endDate } = params;

    const normalizedStartDate = startDate ? normalizePlainDate(startDate) : undefined;
    const normalizedEndDate = endDate ? normalizePlainDate(endDate) : undefined;

    const entries = await this.scoresRepository.findAllByUserId(user.userId, normalizedStartDate, normalizedEndDate);

    return {
      user_id: user.userId,
      entries,
    };
  }
}
