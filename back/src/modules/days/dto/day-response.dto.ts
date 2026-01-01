import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ElementResponseDto } from '../../elements/dto/element-response.dto';

export interface DayElement extends ElementResponseDto {
  completed: boolean;
}

export interface DayCategory extends CategoryResponseDto {
  elements: DayElement[];
}

export class DayResponseDto {
  date_zts: string;
  score: number | null;
  categories: DayCategory[];
}
