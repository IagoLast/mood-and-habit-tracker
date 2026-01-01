import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';

interface InitializeDefaultCategoriesParams {
  userId: string;
}

@Injectable()
export class InitializeDefaultCategoriesService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async execute(params: InitializeDefaultCategoriesParams): Promise<void> {
    const { userId } = params;
    const now = getCurrentTimestampMs();

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
      const categoryResult = await this.pool.query(
        `INSERT INTO categories (
          name, 
          user_id, 
          created_at_timestamp_ms,
          updated_at_timestamp_ms
        ) VALUES ($1, $2, $3, $4) RETURNING id`,
        [category.name, userId, now, now]
      );

      const categoryId = categoryResult.rows[0].id;

      for (const element of category.elements) {
        await this.pool.query(
          `INSERT INTO elements (
            name, 
            category_id,
            icon_name,
            created_at_timestamp_ms,
            updated_at_timestamp_ms
          ) VALUES ($1, $2, $3, $4, $5)`,
          [element.name, categoryId, element.iconName, now, now]
        );
      }
    }
  }
}
