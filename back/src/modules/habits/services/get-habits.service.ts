import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { HabitsResponseDto, HabitCategory } from '../dto/habits-response.dto';
import { CategoriesRepository } from '../repositories/categories.repository';
import { HabitsRepository } from '../repositories/habits.repository';

interface GetHabitsParams {
  user: AuthenticatedUser;
}

@Injectable()
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
