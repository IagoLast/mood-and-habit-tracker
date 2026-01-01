import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { HabitsResponseDto, HabitCategory } from '../dto/habits-response.dto';
import { CategoriesRepository } from '../../categories/repositories/categories.repository';
import { ElementsRepository } from '../../elements/repositories/elements.repository';

interface GetHabitsParams {
  user: AuthenticatedUser;
}

@Injectable()
export class GetHabitsService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly elementsRepository: ElementsRepository,
  ) {}

  async execute(params: GetHabitsParams): Promise<HabitsResponseDto> {
    const { user } = params;

    const categories = await this.categoriesRepository.findAllByUserId(user.userId);
    const habitsCategories: HabitCategory[] = [];

    for (const category of categories) {
      const elements = await this.elementsRepository.findAllByCategoryId(category.id);
      habitsCategories.push({
        ...category,
        elements,
      });
    }

    return {
      categories: habitsCategories,
    };
  }
}
