import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpsertHabitsDto } from '../dto/upsert-habits.dto';
import { HabitsResponseDto, HabitCategory } from '../dto/habits-response.dto';
import { CategoriesRepository } from '../../categories/repositories/categories.repository';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ElementResponseDto } from '../../elements/dto/element-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface UpsertHabitsParams {
  user: AuthenticatedUser;
  dto: UpsertHabitsDto;
}

@Injectable()
export class UpsertHabitsService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly elementsRepository: ElementsRepository,
  ) {}

  async execute(params: UpsertHabitsParams): Promise<HabitsResponseDto> {
    const { user, dto } = params;
    const now = getCurrentTimestampMs();

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
          updatedAtTimestampMs: now,
        });
      } else {
        category = await this.categoriesRepository.create({
          name: categoryDto.name,
          userId: user.userId,
          createdAtTimestampMs: now,
          updatedAtTimestampMs: now,
        });
      }

      if (!category) continue;

      const categoryId = category.id;

      const existingElements = await this.elementsRepository.findAllByCategoryId(categoryId);
      const existingElementIds = new Set(existingElements.map((e) => e.id));
      const existingElementIdsToKeep = new Set<number>();

      const categoryElements: ElementResponseDto[] = [];

      for (const elementDto of categoryDto.elements) {
        let element: ElementResponseDto | null;

        if (elementDto.id && existingElementIds.has(elementDto.id)) {
          existingElementIdsToKeep.add(elementDto.id);
          element = await this.elementsRepository.update({
            id: elementDto.id,
            name: elementDto.name,
            iconName: elementDto.iconName ?? null,
            updatedAtTimestampMs: now,
          });
        } else {
          element = await this.elementsRepository.create({
            name: elementDto.name,
            categoryId,
            iconName: elementDto.iconName ?? null,
            createdAtTimestampMs: now,
            updatedAtTimestampMs: now,
          });
        }

        if (element) {
          categoryElements.push(element);
        }
      }

      for (const elementId of existingElementIds) {
        if (!existingElementIdsToKeep.has(elementId)) {
          await this.elementsRepository.delete(elementId);
        }
      }

      habitsCategories.push({
        ...category,
        elements: categoryElements,
      });
    }

    for (const categoryId of existingCategoryIds) {
      if (!existingCategoryIdsToKeep.has(categoryId)) {
        const categoryElements = await this.elementsRepository.findAllByCategoryId(categoryId);
        for (const element of categoryElements) {
          await this.elementsRepository.delete(element.id);
        }
        await this.categoriesRepository.delete(categoryId, user.userId);
      }
    }

    return {
      categories: habitsCategories,
    };
  }
}
