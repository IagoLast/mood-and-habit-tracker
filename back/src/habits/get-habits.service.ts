import { AuthenticatedUser } from '@/auth/types';
import { CategoriesRepository } from './categories.repository';
import { HabitsRepository } from './habits.repository';
import { HabitsResponseDto, HabitCategory } from './types';

interface GetHabitsParams {
  user: AuthenticatedUser;
}

export class GetHabitsService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly habitsRepository: HabitsRepository,
  ) {}

  async execute(params: GetHabitsParams): Promise<HabitsResponseDto> {
    const { user } = params;

    const categories = await this.categoriesRepository.findAllByUserId(user.userId);
    const habitsCategories: HabitCategory[] = [];

    for (const category of categories) {
      const habits = await this.habitsRepository.findAllByCategoryId(category.id);
      habitsCategories.push({
        ...category,
        elements: habits,
      });
    }

    return {
      categories: habitsCategories,
    };
  }
}
