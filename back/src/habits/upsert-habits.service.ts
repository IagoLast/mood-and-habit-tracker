import { AuthenticatedUser } from '@/auth/types';
import { CategoriesRepository } from './categories.repository';
import { HabitsRepository } from './habits.repository';
import {
  HabitsResponseDto,
  HabitCategory,
  UpsertHabitsDto,
  CategoryResponseDto,
  HabitResponseDto,
} from './types';

interface UpsertHabitsParams {
  user: AuthenticatedUser;
  dto: UpsertHabitsDto;
}

export class UpsertHabitsService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly habitsRepository: HabitsRepository,
  ) {}

  async execute(params: UpsertHabitsParams): Promise<HabitsResponseDto> {
    const { user, dto } = params;

    const existingCategories = await this.categoriesRepository.findAllByUserId(user.userId);
    const existingCategoryIds = new Set(existingCategories.map((c) => c.id));

    const existingCategoryIdsToKeep = new Set<number>();
    const habitsCategories: HabitCategory[] = [];

    for (const categoryDto of dto.categories) {
      let category: CategoryResponseDto | null;

      if (categoryDto.id && existingCategoryIds.has(categoryDto.id)) {
        existingCategoryIdsToKeep.add(categoryDto.id);
        category = await this.categoriesRepository.update({
          id: categoryDto.id,
          userId: user.userId,
          name: categoryDto.name,
        });
      } else {
        category = await this.categoriesRepository.create({
          name: categoryDto.name,
          userId: user.userId,
        });
      }

      if (!category) continue;

      const categoryId = category.id;

      const existingHabits = await this.habitsRepository.findAllByCategoryId(categoryId);
      const existingHabitIds = new Set(existingHabits.map((h) => h.id));
      const existingHabitIdsToKeep = new Set<number>();

      const categoryHabits: HabitResponseDto[] = [];

      for (const habitDto of categoryDto.elements) {
        let habit: HabitResponseDto | null;

        if (habitDto.id && existingHabitIds.has(habitDto.id)) {
          existingHabitIdsToKeep.add(habitDto.id);
          habit = await this.habitsRepository.update({
            id: habitDto.id,
            name: habitDto.name,
            iconName: habitDto.iconName ?? null,
          });
        } else {
          habit = await this.habitsRepository.create({
            name: habitDto.name,
            categoryId,
            iconName: habitDto.iconName ?? null,
          });
        }

        if (habit) {
          categoryHabits.push(habit);
        }
      }

      for (const habitId of Array.from(existingHabitIds)) {
        if (!existingHabitIdsToKeep.has(habitId)) {
          await this.habitsRepository.delete(habitId);
        }
      }

      habitsCategories.push({
        ...category,
        elements: categoryHabits,
      });
    }

    for (const categoryId of Array.from(existingCategoryIds)) {
      if (!existingCategoryIdsToKeep.has(categoryId)) {
        const categoryHabits = await this.habitsRepository.findAllByCategoryId(categoryId);
        for (const habit of categoryHabits) {
          await this.habitsRepository.delete(habit.id);
        }
        await this.categoriesRepository.delete(categoryId, user.userId);
      }
    }

    return {
      categories: habitsCategories,
    };
  }
}
