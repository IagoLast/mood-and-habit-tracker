import { AuthenticatedUser } from '@/auth/types';
import { dateStringToPlainDate } from '@/lib/timestamp';
import { CategoriesRepository } from '@/habits/categories.repository';
import { HabitsRepository } from '@/habits/habits.repository';
import { ScoresRepository } from '@/scores/scores.repository';
import { CompletionsRepository } from './completions.repository';
import { DayResponseDto, DayCategory, DayElement } from './types';

interface GetDayParams {
  user: AuthenticatedUser;
  date: string;
}

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
