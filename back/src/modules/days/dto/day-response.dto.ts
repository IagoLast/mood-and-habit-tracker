import { CategoryResponseDto } from '../../habits/dto/category-response.dto';
import { HabitResponseDto } from '../../habits/dto/habit-response.dto';

export interface DayElement extends HabitResponseDto {
  completed: boolean;
}

export interface DayCategory extends CategoryResponseDto {
  elements: DayElement[];
}

export class DayResponseDto {
  date: string;
  score: number | null;
  categories: DayCategory[];
}
