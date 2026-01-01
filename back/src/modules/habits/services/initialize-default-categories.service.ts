import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { HabitsRepository } from '../repositories/habits.repository';

interface InitializeDefaultCategoriesParams {
  userId: string;
}

@Injectable()
export class InitializeDefaultCategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly habitsRepository: HabitsRepository,
  ) {}

  async execute(params: InitializeDefaultCategoriesParams): Promise<void> {
    const { userId } = params;

    const defaultCategories = [
      {
        name: 'Alimentación',
        elements: [
          { name: 'Comer sano', iconName: 'leaf' },
          { name: 'Comer insano', iconName: 'fast-food' },
        ],
      },
      {
        name: 'Alcohol',
        elements: [
          { name: 'Nada', iconName: 'ban' },
          { name: 'Poco', iconName: 'wine' },
          { name: 'Mucho', iconName: 'beer' },
        ],
      },
      {
        name: 'Sueño',
        elements: [
          { name: 'Malo', iconName: 'moon-outline' },
          { name: 'Bueno', iconName: 'moon' },
        ],
      },
      {
        name: 'Deportes',
        elements: [
          { name: 'Pasear', iconName: 'walk' },
          { name: 'Correr', iconName: 'fitness' },
          { name: 'Surf', iconName: 'MaterialCommunityIcons:surfing' },
          { name: 'Patin', iconName: 'MaterialCommunityIcons:skateboarding' },
          { name: 'Golf', iconName: 'MaterialCommunityIcons:golf' },
          { name: 'Snowboard', iconName: 'MaterialCommunityIcons:snowboard' },
        ],
      },
      {
        name: 'Aficiones',
        elements: [
          { name: 'Leer', iconName: 'book' },
          { name: 'Escribir', iconName: 'create' },
          { name: 'Guitarra', iconName: 'MaterialCommunityIcons:guitar-electric' },
        ],
      },
      {
        name: 'Social',
        elements: [
          { name: 'Tiempo en familia', iconName: 'people' },
          { name: 'Tiempo con amigos', iconName: 'people-circle' },
          { name: 'Tiempo en pareja', iconName: 'heart' },
        ],
      },
    ];

    for (const category of defaultCategories) {
      const categoryId = await this.categoriesRepository.createAndReturnId({
        name: category.name,
        userId,
      });

      for (const element of category.elements) {
        await this.habitsRepository.createWithoutReturn({
          name: element.name,
          categoryId,
          iconName: element.iconName,
        });
      }
    }
  }
}
