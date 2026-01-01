import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { DayResponseDto, DayCategory, DayElement } from '../dto/day-response.dto';
import { dateStringToDateZts } from '../../../common/utils/timestamp';
import { CategoriesRepository } from '../../categories/repositories/categories.repository';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
import { ScoresRepository } from '../../scores/repositories/scores.repository';
import { CompletionsRepository } from '../../completions/repositories/completions.repository';

interface GetDayParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class GetDayService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly elementsRepository: ElementsRepository,
    private readonly scoresRepository: ScoresRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: GetDayParams): Promise<DayResponseDto> {
    const { user, date } = params;
    const dateZts = dateStringToDateZts(date);

    const categories = await this.categoriesRepository.findAllByUserId(user.userId);
    const score = await this.scoresRepository.findByUserIdAndDateZts(user.userId, dateZts);
    const completedElementIds = await this.completionsRepository.findByUserIdAndDateZts(user.userId, dateZts);
    const completedElementIdsSet = new Set(completedElementIds);

    const dayCategories: DayCategory[] = [];

    for (const category of categories) {
      const elements = await this.elementsRepository.findAllByCategoryId(category.id);

      const dayElements: DayElement[] = elements.map((element) => ({
        ...element,
        completed: completedElementIdsSet.has(element.id),
      }));

      dayCategories.push({
        ...category,
        elements: dayElements,
      });
    }

    return {
      date_zts: dateZts,
      score,
      categories: dayCategories,
    };
  }
}
