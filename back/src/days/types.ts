import { CategoryResponseDto, HabitResponseDto } from '@/habits/types';

export interface DayElement extends HabitResponseDto {
  completed: boolean;
}

export interface DayCategory extends CategoryResponseDto {
  elements: DayElement[];
}

export interface DayResponseDto {
  date: string;
  score: number | null;
  categories: DayCategory[];
}

export interface ElementCompletionDto {
  elementId: number;
  completed: 'COMPLETED' | 'NOT_COMPLETED';
}

export interface UpdateDayDto {
  date?: string;
  score?: number | null;
  elements: ElementCompletionDto[];
}
