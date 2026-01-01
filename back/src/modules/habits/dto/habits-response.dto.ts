import { CategoryResponseDto } from './category-response.dto';
import { HabitResponseDto } from './habit-response.dto';

export interface HabitCategory extends CategoryResponseDto {
  elements: HabitResponseDto[];
}

export class HabitsResponseDto {
  categories: HabitCategory[];
}
