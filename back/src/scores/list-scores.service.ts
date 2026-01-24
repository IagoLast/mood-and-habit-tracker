import { AuthenticatedUser } from '@/auth/types';
import { normalizePlainDate } from '@/lib/timestamp';
import { ScoresRepository } from './scores.repository';
import { ListScoresResponseDto } from './types';

interface ListScoresParams {
  user: AuthenticatedUser;
  startDate?: string;
  endDate?: string;
}

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
