import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ElementResponseDto } from '../../elements/dto/element-response.dto';

export interface HabitCategory extends CategoryResponseDto {
  elements: ElementResponseDto[];
}

export class HabitsResponseDto {
  categories: HabitCategory[];
}
