import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { DayResponseDto, DayCategory, DayElement } from '../dto/day-response.dto';
import { dateStringToPlainDate } from '../../../common/utils/timestamp';
import { CategoriesRepository } from '../../habits/repositories/categories.repository';
import { HabitsRepository } from '../../habits/repositories/habits.repository';
import { ScoresRepository } from '../../scores/repositories/scores.repository';
import { CompletionsRepository } from '../repositories/completions.repository';

interface GetDayParams {
  user: AuthenticatedUser;
  date: string;
}

@Injectable()
export class GetDayService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly habitsRepository: HabitsRepository,
    private readonly scoresRepository: ScoresRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: GetDayParams): Promise<DayResponseDto> {
    const { user, date } = params;
    const plainDate = dateStringToPlainDate(date);

    const categories = await this.categoriesRepository.findAllByUserId(user.userId);
    const score = await this.scoresRepository.findByUserIdAndDate(user.userId, plainDate);
    const completedHabitIds = await this.completionsRepository.findByUserIdAndDate(
      user.userId,
      plainDate,
    );
    const completedHabitIdsSet = new Set(completedHabitIds);

    const dayCategories: DayCategory[] = [];

    for (const category of categories) {
      const habits = await this.habitsRepository.findAllByCategoryId(category.id);

      const dayElements: DayElement[] = habits.map((habit) => ({
        ...habit,
        completed: completedHabitIdsSet.has(habit.id),
      }));

      dayCategories.push({
        ...category,
        elements: dayElements,
      });
    }

    return {
      date: plainDate,
      score,
      categories: dayCategories,
    };
  }
}
